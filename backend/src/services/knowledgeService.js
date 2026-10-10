import Concept from "../models/Concept.js";
import Instance from "../models/Instance.js";
import Relationship from "../models/Relationship.js";
import FileContext from "../models/FileContext.js";
import Metadata from "../models/Metadata.js";
import File from "../models/File.js";
import ActivityLog from "../models/ActivityLog.js";
import { FILE_STATUS } from "../utils/constants.js";
import { createActivityLog } from "./activityService.js";
import { ACTIVITY_ACTIONS, ENTITY_TYPES } from "../utils/constants.js";

const notFound = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

export const getConceptTree = async () => {
  const concepts = await Concept.find().sort({ name: 1 }).lean();
  const nodes = new Map(concepts.map((concept) => [String(concept._id), { ...concept, children: [] }]));
  const roots = [];

  nodes.forEach((node) => {
    const parent = node.parentConceptId && nodes.get(String(node.parentConceptId));
    if (parent) parent.children.push(node);
    else roots.push(node);
  });

  return roots;
};

export const createConcept = async ({ name, type, parentConceptId, description, performedBy }) => {
  if (!String(name || "").trim()) {
    const error = new Error("A concept name is required");
    error.statusCode = 400;
    throw error;
  }

  if (parentConceptId) {
    const parent = await Concept.exists({ _id: parentConceptId });
    if (!parent) throw notFound("Parent concept not found");
  }

  const concept = await Concept.create({ name: name.trim(), type: type?.trim() || "", parentConceptId: parentConceptId || null, description: description?.trim() || "" });
  await createActivityLog({ action: ACTIVITY_ACTIONS.CONCEPT_CREATED, entityType: ENTITY_TYPES.CONCEPT, entityId: concept._id, performedBy, message: `Concept created: ${concept.name}` });
  return concept;
};

export const getInstances = async ({ conceptId } = {}) => {
  const query = conceptId ? { conceptId } : {};
  return Instance.find(query).populate("conceptId", "name type").sort({ createdAt: -1 });
};

export const createInstance = async ({ conceptId, name, attributes, performedBy }) => {
  if (!conceptId || !String(name || "").trim()) {
    const error = new Error("Concept and instance name are required");
    error.statusCode = 400;
    throw error;
  }
  const concept = await Concept.exists({ _id: conceptId });
  if (!concept) throw notFound("Concept not found");
  const instance = await Instance.create({ conceptId, name: name.trim(), attributes: attributes || {} });
  await createActivityLog({ action: ACTIVITY_ACTIONS.INSTANCE_CREATED, entityType: ENTITY_TYPES.INSTANCE, entityId: instance._id, performedBy, message: `Instance created: ${instance.name}`, metadata: { conceptId } });
  return instance;
};

export const getRelationships = async ({ sourceId, targetId } = {}) => {
  const query = {};
  if (sourceId || targetId) query.$or = [{ sourceId }, { targetId }].filter((item) => Object.values(item)[0]);
  return Relationship.find(query).sort({ createdAt: -1 });
};

export const createRelationship = async ({ sourceType, sourceId, targetType, targetId, relationshipType, description, performedBy }) => {
  if (![sourceType, sourceId, targetType, targetId, relationshipType].every(Boolean)) {
    const error = new Error("Source, target, and relationship type are required");
    error.statusCode = 400;
    throw error;
  }
  const relationship = await Relationship.create({ sourceType, sourceId, targetType, targetId, relationshipType: relationshipType.trim(), description: description?.trim() || "" });
  await createActivityLog({ action: ACTIVITY_ACTIONS.RELATIONSHIP_CREATED, entityType: ENTITY_TYPES.RELATIONSHIP, entityId: relationship._id, performedBy, message: `Relationship created: ${sourceType} ${relationship.relationshipType} ${targetType}`, metadata: { sourceId, targetId } });
  return relationship;
};

export const removeRelationship = async ({ id, performedBy }) => {
  const relationship = await Relationship.findByIdAndDelete(id);
  if (!relationship) throw notFound("Relationship not found");
  await createActivityLog({ action: ACTIVITY_ACTIONS.RELATIONSHIP_DELETED, entityType: ENTITY_TYPES.RELATIONSHIP, entityId: relationship._id, performedBy, message: "Relationship removed", metadata: { sourceId: relationship.sourceId, targetId: relationship.targetId } });
  return relationship;
};

export const getInvertedFileTree = async ({ type = "department", status = FILE_STATUS.CONTENT } = {}) => {
  const contextFields = ["employee", "department", "event", "year", "category", "tags"];
  const filesByValue = new Map();
  const addFile = (value, file) => {
    const label = String(value || "").trim();
    if (!label || !file) return;
    if (!filesByValue.has(label)) filesByValue.set(label, []);
    filesByValue.get(label).push({ _id: file._id, originalName: file.originalName, status: file.status, mimeType: file.mimeType });
  };

  if (type === "metadata") {
    const metadata = await Metadata.find().populate({ path: "fileId", match: { status }, select: "originalName status mimeType" }).sort({ key: 1, value: 1 });
    metadata.forEach((item) => addFile(`${item.key}: ${item.value}`, item.fileId));
  } else {
    const field = contextFields.includes(type) ? type : "department";
    const contexts = await FileContext.find().populate({ path: "fileId", match: { status }, select: "originalName status mimeType" });
    contexts.forEach((context) => {
      const values = field === "tags" ? context.tags : [context[field]];
      values.forEach((value) => addFile(value, context.fileId));
    });
  }

  return [...filesByValue.entries()]
    .map(([value, files]) => ({ value, count: files.length, files: files.sort((a, b) => a.originalName.localeCompare(b.originalName)) }))
    .sort((a, b) => a.value.localeCompare(b.value));
};

export const getFileProvenance = async (fileId) => {
  const [file, context, metadata, activities, relationships] = await Promise.all([
    File.findById(fileId).lean(),
    FileContext.findOne({ fileId }).lean(),
    Metadata.find({ fileId }).sort({ key: 1 }).lean(),
    ActivityLog.find({ entityId: fileId }).sort({ createdAt: -1 }).limit(50).lean(),
    Relationship.find({ $or: [{ sourceId: fileId }, { targetId: fileId }] }).sort({ createdAt: -1 }).lean()
  ]);
  if (!file) throw notFound("File not found");
  return {
    file: { _id: file._id, originalName: file.originalName, sha256Hash: file.sha256Hash, status: file.status, createdAt: file.createdAt, uploadedBy: file.uploadedBy },
    context: context ? { employee: context.employee, department: context.department, event: context.event, year: context.year, category: context.category, tags: context.tags } : null,
    metadata,
    activities,
    relationships
  };
};

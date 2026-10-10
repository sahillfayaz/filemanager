import { apiClient, unwrap } from "./client.js";

export const getFiles = async ({ status = "content", page = 1, limit = 20 } = {}) => {
  return unwrap(await apiClient.get("/files", { params: { status, page, limit } }));
};

export const getFileDetails = async (id) => {
  return unwrap(await apiClient.get(`/files/${id}`));
};

export const uploadFile = async (payload, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", payload.file);
  ["employee", "department", "event", "year", "category", "tags", "description", "uploadedBy"].forEach((field) => {
    if (payload[field]) formData.append(field, payload[field]);
  });

  const extraMetadata = payload.metadataItems?.filter((item) => item.key && item.value) || [];
  if (extraMetadata.length > 0) {
    formData.append("metadata", JSON.stringify(extraMetadata));
  }

  return unwrap(
    await apiClient.post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress
    })
  );
};

export const archiveFile = async (id, performedBy = "Workspace Operator") => {
  return unwrap(await apiClient.patch(`/files/${id}/archive`, { performedBy }));
};

export const restoreFile = async (id, performedBy = "Workspace Operator") => {
  return unwrap(await apiClient.patch(`/files/${id}/restore`, { performedBy }));
};

export const moveToDeletion = async (id, performedBy = "Workspace Operator") => {
  return unwrap(await apiClient.patch(`/files/${id}/deletion`, { performedBy }));
};

export const permanentDelete = async (id, performedBy = "Workspace Operator") => {
  return unwrap(await apiClient.delete(`/files/${id}/permanent`, { data: { performedBy } }));
};

export const downloadFile = async (id, fileName = "download") => {
  const response = await apiClient.get(`/files/${id}/download`, { responseType: "blob" });
  const url = URL.createObjectURL(response);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

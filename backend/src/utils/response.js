export const successResponse = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message = "Internal server error", statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    details
  });
};

export const normalizeText = (value) => String(value || "").trim().toLowerCase();

export const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  return String(tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

export const parseMetadataInput = (metadata) => {
  if (!metadata) return [];
  if (Array.isArray(metadata)) return metadata;

  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

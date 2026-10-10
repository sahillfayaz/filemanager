import { contextSearch, generalSearch, hashSearch } from "../services/searchService.js";
import { successResponse } from "../utils/response.js";

export const searchFiles = async (req, res, next) => {
  try {
    const results = await generalSearch({
      query: req.query.query || req.query.q,
      status: req.query.status,
      performedBy: req.query.performedBy
    });
    return successResponse(res, results, "Search completed successfully");
  } catch (error) {
    return next(error);
  }
};

export const searchByContext = async (req, res, next) => {
  try {
    const results = await contextSearch({
      query: req.query,
      status: req.query.status,
      performedBy: req.query.performedBy
    });
    return successResponse(res, results, "Context search completed successfully");
  } catch (error) {
    return next(error);
  }
};

export const searchByHash = async (req, res, next) => {
  try {
    const results = await hashSearch({
      sha256Hash: req.params.sha256Hash,
      performedBy: req.query.performedBy
    });
    return successResponse(res, results, "Hash search completed successfully");
  } catch (error) {
    return next(error);
  }
};

import mongoose from "mongoose";

export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(value)) {
      const error = new Error(`Invalid ${paramName}`);
      error.statusCode = 400;
      return next(error);
    }

    return next();
  };
};

const fail = (message) => Object.assign(new Error(message), { statusCode: 400 });

export const requireFields = (...fields) => (req, res, next) => {
  const missing = fields.filter((field) => !String(req.body?.[field] ?? "").trim());
  return missing.length ? next(fail(`Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`)) : next();
};

export const limitTextFields = (fields, maxLength = 500) => (req, res, next) => {
  const tooLong = fields.find((field) => String(req.body?.[field] ?? "").length > maxLength);
  return tooLong ? next(fail(`${tooLong} must not exceed ${maxLength} characters`)) : next();
};

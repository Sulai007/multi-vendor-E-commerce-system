"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const apiError_1 = require("../utils/apiError");
const validate = (schema) => (req, _res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        if (parsed.body)
            req.body = parsed.body;
        if (parsed.params)
            req.params = parsed.params;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const details = error.issues.map((issue) => ({
                path: issue.path.slice(1).join("."),
                message: issue.message,
            }));
            return next(apiError_1.ApiError.badRequest("Validation failed", details));
        }
        next(error);
    }
};
exports.validate = validate;

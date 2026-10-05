"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const apiError_1 = require("../utils/apiError");
const catchAsync_1 = require("../utils/catchAsync");
const index_1 = require("../models/index");
const tokenHelper_1 = require("../helper/tokenHelper");
const extractBearerToken = (req) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        throw apiError_1.ApiError.unauthorized("Authorization header missing", 401);
    }
    return header.slice("Bearer ".length).trim();
};
exports.authenticate = (0, catchAsync_1.catchAsync)(async (req, _res, next) => {
    const token = extractBearerToken(req);
    let payload;
    try {
        payload = (0, tokenHelper_1.verifyAccessToken)(token);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            throw apiError_1.ApiError.unauthorized("Access token expired", 401);
        }
        if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            throw apiError_1.ApiError.unauthorized("Invalid access token", 401);
        }
        throw error;
    }
    const blacklistedToken = await index_1.BlacklistedToken.findOne({ where: { jti: payload.jti } });
    if (blacklistedToken) {
        throw apiError_1.ApiError.unauthorized("Token has been revoked", 401);
    }
    const user = await index_1.User.findByPk(payload.sub);
    if (!user || !user) {
        throw apiError_1.ApiError.unauthorized("Account is no longer active", 401);
    }
    req.user = payload;
    next();
});
const authorize = (...roles) => (req, _res, next) => {
    if (!req.user) {
        return next(apiError_1.ApiError.unauthorized("User not authenticated", 401));
    }
    if (roles.length && !roles.includes(req.user.role)) {
        return next(apiError_1.ApiError.forbidden("You do not have permission to access this resource", 403));
    }
    next();
};
exports.authorize = authorize;

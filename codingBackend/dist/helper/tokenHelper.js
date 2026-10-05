"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToken = exports.verifyPasswordResetToken = exports.signRefreshToken = exports.signPasswordResetToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.signBusinessAccessToken = exports.signAccessToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const env_1 = require("../config/env");
// export interface IssuedRefreshToken {
//     token: string;
//     jti: string;
//     expiresAt: Date;
// }
const decodeExpiry = (token) => {
    const decoded = jsonwebtoken_1.default.decode(token);
    if (!decoded?.exp) {
        throw new Error("Unable to determine token expiry");
    }
    return new Date(decoded.exp * 1000);
};
const signAccessToken = (user) => {
    const jti = (0, uuid_1.v4)();
    const payload = { sub: user.id, email: user.email, role: user.role, jti };
    const token = jsonwebtoken_1.default.sign(payload, env_1.config.jwt.accesssecret, {
        expiresIn: env_1.config.jwt.refreshexpiresIn,
    });
    return { token, jti, expiresAt: decodeExpiry(token) };
};
exports.signAccessToken = signAccessToken;
const signBusinessAccessToken = (user) => {
    const jti = (0, uuid_1.v4)();
    const payload = { sub: user.id, email: user.email, role: user.role, businessId: user.businessId, jti };
    const token = jsonwebtoken_1.default.sign(payload, env_1.config.jwt.accesssecret, {
        expiresIn: env_1.config.jwt.refreshexpiresIn,
    });
    return { token, jti, expiresAt: decodeExpiry(token) };
};
exports.signBusinessAccessToken = signBusinessAccessToken;
const verifyAccessToken = (token) => jsonwebtoken_1.default.verify(token, env_1.config.jwt.accesssecret);
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => jsonwebtoken_1.default.verify(token, env_1.config.jwt.refreshsecret);
exports.verifyRefreshToken = verifyRefreshToken;
const signPasswordResetToken = (userId) => {
    const payload = { sub: userId, purpose: "password-reset", jti: (0, uuid_1.v4)() };
    return jsonwebtoken_1.default.sign(payload, env_1.config.jwt.resetsecret, {
        expiresIn: env_1.config.jwt.resetexpiresIn,
    });
};
exports.signPasswordResetToken = signPasswordResetToken;
const signRefreshToken = (userId) => {
    const jti = (0, uuid_1.v4)();
    const payload = { sub: userId, jti };
    const token = jsonwebtoken_1.default.sign(payload, env_1.config.jwt.refreshsecret, {
        expiresIn: env_1.config.jwt.refreshexpiresIn,
    });
    return { token, jti, expiresAt: decodeExpiry(token) };
};
exports.signRefreshToken = signRefreshToken;
const verifyPasswordResetToken = (token) => jsonwebtoken_1.default.verify(token, env_1.config.jwt.resetsecret);
exports.verifyPasswordResetToken = verifyPasswordResetToken;
/**
 * Refresh tokens are high-entropy JWTs, so a fast deterministic hash(rather than bcrypt)
 * is sufficient, it lets us index-lookup the token in the DB without ever storing it in plaintext
 */
const hashToken = (token) => crypto_1.default.createHash("sha256").update(token).digest("hex");
exports.hashToken = hashToken;

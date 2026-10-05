"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.refreshToken = exports.resetPassword = exports.forgotPassword = exports.resendOtp = exports.verifyOtp = exports.login = exports.register = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const authService = __importStar(require("../services/auth.service"));
const requestMeta = (req) => ({
    userAgent: req.headers["user-agent"] ?? null,
    ipAddress: req.ip ?? null,
});
exports.register = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await authService.registerUser(req.body);
    (0, apiResponse_1.sendSuccess)(res, {
        statusCode: 201,
        message: "Registration successful. Please check your email for a verification code.",
        data: { user },
    });
});
exports.login = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await authService.loginUser(req.body, requestMeta(req));
    (0, apiResponse_1.sendSuccess)(res, { message: "login successful", data: result });
});
exports.verifyOtp = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await authService.verifyOtp(req.body);
    if (result.type === "email_verified") {
        return (0, apiResponse_1.sendSuccess)(res, { message: "Email verified successfully", data: { user: result.user } });
    }
    (0, apiResponse_1.sendSuccess)(res, {
        message: "Code verified. use the reset token to set a new password.",
        data: { resetToken: result.resetToken },
    });
});
exports.resendOtp = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await authService.resendOtp(req.body);
    (0, apiResponse_1.sendSuccess)(res, { message: "If eleigible, a new code has been sent to yout email" });
});
exports.forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    (0, apiResponse_1.sendSuccess)(res, { message: "If an account with that email exists, a reset code has been sent" });
});
exports.resetPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await authService.resetPassword(req.body);
    (0, apiResponse_1.sendSuccess)(res, { message: "Password has been reset successfully. Please log in with your new password" });
});
exports.refreshToken = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await authService.refreshTokens(req.body.refreshToken, requestMeta(req));
    (0, apiResponse_1.sendSuccess)(res, { message: "Token refreshed successfully", data: result });
});
exports.logout = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw apiError_1.ApiError.unauthorized();
    }
    await authService.logOutUser(req.body.refreshToken, req.user);
    (0, apiResponse_1.sendSuccess)(res, { message: "logged out successfully" });
});
exports.me = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.user) {
        throw apiError_1.ApiError.unauthorized();
    }
    const user = await authService.getProfile(req.user.sub);
    (0, apiResponse_1.sendSuccess)(res, { message: "Profile retrieved successfully", data: { user } });
});
// export const getApiLogs = catchAsync(async (req: Request, res: Response) => {
//     const logs = await authService.getApiLogs();
//     sendSuccess(res, { message: "API logs retrieved successfully", data: { logs } });
// });
// export const updatePassword = catchAsync(async (req: Request, res: Response) => {
//     await authService.updatePassword(req.body.password);
//     sendSuccess(res, { message: "Password set successfully"} )
//     });

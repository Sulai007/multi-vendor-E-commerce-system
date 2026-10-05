"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.logOutUser = exports.refreshTokens = exports.resetPassword = exports.forgotPassword = exports.resendOtp = exports.verifyOtp = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const models_1 = require("../models");
const apiError_1 = require("../utils/apiError");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const passwordHelper_1 = require("../helper/passwordHelper");
const otpHelper_1 = require("../helper/otpHelper");
const tokenHelper_1 = require("../helper/tokenHelper");
const authEmail_1 = require("../email/authEmail");
const issueOtp = async (userId, purpose) => {
    await models_1.Otp.update({ consumedAt: new Date() }, { where: { userId, purpose, consumedAt: null } });
    const code = (0, otpHelper_1.generateOtpCode)();
    const codeHash = await (0, otpHelper_1.hashOtp)(code);
    await models_1.Otp.create({
        userId,
        codeHash,
        purpose,
        expiresAt: (0, otpHelper_1.otpExpiryDate)(),
    });
    return code;
};
const assertOtpCoolDown = async (userId, purpose) => {
    const lastOtp = await models_1.Otp.findOne({
        where: { userId, purpose },
        order: [["createdAt", "DESC"]],
    });
    if (!lastOtp)
        return;
    const secondsSinceLast = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
    if (secondsSinceLast < env_1.config.otp.resendCooldownSeconds) {
        const wait = Math.ceil(env_1.config.otp.resendCooldownSeconds - secondsSinceLast);
        throw new apiError_1.ApiError(429, `Please wait ${wait} seconds before requesting a new OTP.`);
    }
};
const consumeOtp = async (userId, purpose, code) => {
    const otp = await models_1.Otp.findOne({ where: { userId, purpose, consumedAt: null },
        order: [["createdAt", "DESC"]] });
    if (!otp) {
        throw apiError_1.ApiError.badRequest("Invalid or expired OTP.");
    }
    if (otp.expiresAt.getTime() < Date.now()) {
        throw apiError_1.ApiError.badRequest("OTP has expired.");
    }
    if (otp.attempts >= env_1.config.otp.maxAttempts) {
        throw apiError_1.ApiError.badRequest("Maximum OTP attempts exceeded.");
    }
    const isMatch = await (0, otpHelper_1.compareOtp)(code, otp.codeHash);
    if (!isMatch) {
        otp.attempts += 1;
        await otp.save();
        throw apiError_1.ApiError.badRequest("Invalid OTP code.");
    }
    otp.consumedAt = new Date();
    await otp.save();
    return otp;
};
const issueTokenPair = async (user, meta) => {
    const access = (0, tokenHelper_1.signAccessToken)({ id: user.id, email: user.email, role: user.role });
    const refresh = (0, tokenHelper_1.signRefreshToken)(user.id);
    await models_1.RefreshToken.create({
        userId: user.id,
        tokenHash: (0, tokenHelper_1.hashToken)(refresh.token),
        expiresAt: refresh.expiresAt,
        userAgent: meta.userAgent ?? null,
        ipAddress: meta.ipAddress ?? null,
    });
    return { accessToken: access.token,
        refreshToken: refresh.token,
        accessTokenExpiresAt: access.expiresAt,
        refreshTokenExpiresAt: refresh.expiresAt
    };
};
const issueBizTokenPair = async (user, meta, business) => {
    const access = (0, tokenHelper_1.signBusinessAccessToken)({ id: user.id, email: user.email, role: user.role, businessId: business.userId });
    const refresh = (0, tokenHelper_1.signRefreshToken)(user.id);
    await models_1.RefreshToken.create({
        userId: user.id,
        tokenHash: (0, tokenHelper_1.hashToken)(refresh.token),
        expiresAt: refresh.expiresAt,
        userAgent: meta.userAgent ?? null,
        ipAddress: meta.ipAddress ?? null,
    });
    return { accessToken: access.token,
        refreshToken: refresh.token,
        accessTokenExpiresAt: access.expiresAt,
        refreshTokenExpiresAt: refresh.expiresAt
    };
};
const registerUser = async (input) => {
    const existing = await models_1.User.findOne({ where: { email: input.email } });
    if (existing) {
        if (existing.isEmailVerified) {
            throw new apiError_1.ApiError(409, "User with this email already exists.");
        }
        existing.firstName = input.firstName;
        existing.lastName = input.lastName;
        existing.password = await (0, passwordHelper_1.hashPassword)(input.password);
        await existing.save();
        const code = await issueOtp(existing.id, "email_verification");
        logger_1.logger.info(`Use this for your OTP Code ${code}`);
        await (0, authEmail_1.sendOtpEmail)({
            to: existing.email,
            firstName: existing.firstName,
            code,
            purpose: "email_verification",
        });
        return existing?.toSafeJSON();
    }
    ;
    const user = await models_1.User.create({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        address: input.address,
        password: await (0, passwordHelper_1.hashPassword)(input.password),
    });
    const code = await issueOtp(user.id, "email_verification");
    logger_1.logger.info(`Use this for your OTP Code ${code}`);
    await (0, authEmail_1.sendOtpEmail)({
        to: user.email,
        firstName: user.firstName,
        code,
        purpose: "email_verification",
    });
    return user.toSafeJSON();
};
exports.registerUser = registerUser;
const loginUser = async (input, meta) => {
    const user = await models_1.User.scope("withPassword").findOne({ where: { email: input.email } });
    if (!user || !(await (0, passwordHelper_1.comparePassword)(input.password, user.password))) {
        throw new apiError_1.ApiError(401, "Invalid email or password.");
    }
    if (!user.isActive) {
        throw new apiError_1.ApiError(401, "User account is deactivated.");
    }
    if (!user.isEmailVerified) {
        throw apiError_1.ApiError.unauthorized("Email is not verified. Please verify your email before logging in.");
    }
    if (user.role === "vendor") {
        const business = await models_1.vendorBusiness.findOne({ where: {
                userId: user.id
            } });
        const biztokens = await issueBizTokenPair(user, meta, business);
        user.lastLoginAt = new Date();
        await user.save();
        return { user: user.toSafeJSON(), ...biztokens };
    }
    const tokens = await issueTokenPair(user, meta);
    user.lastLoginAt = new Date();
    await user.save();
    return { user: user.toSafeJSON(), ...tokens };
};
exports.loginUser = loginUser;
const verifyOtp = async (input) => {
    const user = await models_1.User.findOne({ where: { email: input.email } });
    if (!user) {
        throw apiError_1.ApiError.badRequest('Invalid email or OTP.');
    }
    await consumeOtp(user.id, input.purpose, input.code);
    if (input.purpose === "email_verification") {
        user.isEmailVerified = true;
        await user.save();
        return { type: "email_verified", user: user.toSafeJSON() };
    }
    const resetToken = (0, tokenHelper_1.signPasswordResetToken)(user.id);
    return { type: "password_reset_token", resetToken };
};
exports.verifyOtp = verifyOtp;
const resendOtp = async (input) => {
    const user = await models_1.User.findOne({ where: { email: input.email } });
    if (input.purpose === "email_verification") {
        if (!user) {
            throw apiError_1.ApiError.notFound("User with this email does not exist.");
        }
        if (user.isEmailVerified) {
            throw apiError_1.ApiError.badRequest("Email is already verified.");
        }
        else if (!user) {
            return;
        }
        await assertOtpCoolDown(user.id, input.purpose);
        const code = await issueOtp(user.id, input.purpose);
        logger_1.logger.info(`Use this for your OPT Code ${code}`);
        await (0, authEmail_1.sendOtpEmail)({
            to: user.email,
            firstName: user.firstName,
            code,
            purpose: input.purpose,
        });
    }
};
exports.resendOtp = resendOtp;
const forgotPassword = async (email) => {
    const user = await models_1.User.findOne({ where: { email } });
    if (!user)
        return;
    await assertOtpCoolDown(user.id, "password_reset");
    const code = await issueOtp(user.id, "password_reset");
    await (0, authEmail_1.sendOtpEmail)({ to: user.email, firstName: user.firstName, code, purpose: "password_reset" });
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (input) => {
    let payload;
    try {
        payload = (0, tokenHelper_1.verifyPasswordResetToken)(input.resetToken);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            throw apiError_1.ApiError.unauthorized("reset link has expired");
        }
        if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            throw apiError_1.ApiError.unauthorized("Invalid reset Token");
        }
        throw error;
    }
    const user = await models_1.User.findByPk(payload.sub);
    if (!user) {
        throw apiError_1.ApiError.unauthorized("Invalid reset Token");
    }
    user.password = await (0, passwordHelper_1.hashPassword)(input.newPassword);
    await user.save();
    await models_1.RefreshToken.update({ revokedAt: new Date() }, { where: { userId: user.id, revokedAt: null } });
    await (0, authEmail_1.sendPasswordChangedEmail)({ to: user.email, firstName: user.firstName });
};
exports.resetPassword = resetPassword;
const refreshTokens = async (rawRefreshToken, meta) => {
    let payload;
    try {
        payload = (0, tokenHelper_1.verifyRefreshToken)(rawRefreshToken);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            throw apiError_1.ApiError.unauthorized("refresh token has expired, login again!!");
        }
        if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            throw apiError_1.ApiError.unauthorized("invalid refresh token");
        }
        throw error;
    }
    const tokenHash = (0, tokenHelper_1.hashToken)(rawRefreshToken);
    const record = await models_1.RefreshToken.findOne({ where: { tokenHash } });
    if (!record) {
        throw apiError_1.ApiError.unauthorized("invalid refresh token");
    }
    if (record.revokedAt) {
        //re-use of an already revoked function suggests theft, burn every session for this user.
        await models_1.RefreshToken.update({ revokedAt: new Date() }, { where: { userId: record.userId, revokedAt: null } });
        logger_1.logger.warn("Refresh token reuse detected - all sessions revoked", { userId: record.userId });
        throw apiError_1.ApiError.unauthorized("session invalidated, please log in again");
    }
    if (record.expiresAt.getTime() < Date.now()) {
        throw apiError_1.ApiError.unauthorized("Refresh token has expired, please log in again");
    }
    const user = await models_1.User.findByPk(record.userId);
    if (!user || !user.isActive) {
        throw apiError_1.ApiError.unauthorized("Account is no longer acitve");
    }
    const tokens = await issueTokenPair(user, meta);
    record.revokedAt = new Date();
    record.replacedByTokenHash = (0, tokenHelper_1.hashToken)(tokens.refreshToken);
    await record.save();
    return { user: user.toSafeJSON(), ...tokens };
};
exports.refreshTokens = refreshTokens;
const logOutUser = async (rawRefreshToken, accessTokenPayload) => {
    const tokenHash = (0, tokenHelper_1.hashToken)(rawRefreshToken);
    await models_1.RefreshToken.update({ revokedAt: new Date() }, { where: { tokenHash, revokedAt: null } });
    if (accessTokenPayload.exp) {
        await models_1.BlacklistedToken.findOrCreate({
            where: { jti: accessTokenPayload.jti },
            defaults: {
                jti: accessTokenPayload.jti,
                userId: accessTokenPayload.sub,
                expiresAt: new Date(accessTokenPayload.exp * 1000),
                reason: "logout",
            },
        });
    }
};
exports.logOutUser = logOutUser;
const getProfile = async (userId) => {
    const user = await models_1.User.findByPk(userId);
    if (!user) {
        throw apiError_1.ApiError.notFound("User not found");
    }
    return user.toSafeJSON();
};
exports.getProfile = getProfile;
// export const getApiLogs = async () => {
//     const logs = await apiLogs.findAll({
//         order: [["createdAt", "DESC"]]});
//         return logs.map(log => ({
//             id: log.id,
//             method: log.method,
//             statusCode: log.statusCode,
//             ipAddress: log.ipAddress     
//         }));
//     };
// export const updatePassword = async (newPassword: string) => {
//     const hashedPassword = await hashPassword(newPassword);
//     await appSetting.upsert({
//         key: "admin_password",
//         value: hashedPassword,
//     });
// };

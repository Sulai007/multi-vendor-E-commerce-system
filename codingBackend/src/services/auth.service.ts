import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { User, Otp, RefreshToken, BlacklistedToken, OtpPurpose } from "../models";
import { ApiError } from "../utils/apiError";
import { logger } from "../utils/logger";
import { config } from "../config/env";
import { hashPassword, comparePassword } from "../helper/passwordHelper";
import { generateOtpCode, hashOtp, compareOtp, otpExpiryDate } from "../helper/otpHelper";
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    hashToken,
    signPasswordResetToken,
    verifyPasswordResetToken,
    AccessTokenPayload,
} from "../helper/tokenHelper";
//import { sendOtpEmail, sendpasswordchnagedemail } from "../email";



export interface RequestMeta {
    userAgent?: string | null;
    ipAddress?: string | null;
}

const issueOtp = async (userId: string, purpose: OtpPurpose): Promise<string> => {
    await Otp.update({ consumedAt: new Date() }, { where: { userId, purpose, consumedAt: null } });
    const code = generateOtpCode();
    const codeHash = await hashOtp(code);

    await Otp.create({
        userId,
        codeHash,
        purpose,
        expiresAt: otpExpiryDate(),
    });
    return code;
};

const assertOtpCoolDown = async (userId: string, purpose: OtpPurpose): Promise<void> => {
    const lastOtp = await Otp.findOne({
        where: { userId, purpose },
        order: [["createdAt", "DESC"]],
    });
    if (!lastOtp) return;

    const secondsSinceLast = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
    if (secondsSinceLast < config.otp.resendCooldownSeconds) {
        const wait = Math.ceil(config.otp.resendCooldownSeconds - secondsSinceLast);
        throw new ApiError(429, `Please wait ${wait} seconds before requesting a new OTP.`);
    }
};

const consumeOtp = async (userId: string, purpose: OtpPurpose, code: string): Promise<Otp> => {
    const otp = await Otp.findOne({ where: { userId, purpose, consumedAt: null },
    order: [["createdAt", "DESC"]] });
    if (!otp) {
        throw ApiError.badRequest("Invalid or expired OTP.");
    }

    if(otp.expiresAt.getTime() < Date.now()) {
        throw ApiError.badRequest("OTP has expired.");
    }
    if (otp.attempts >= config.otp.maxAttempts) {
        throw ApiError.badRequest("Maximum OTP attempts exceeded.");
    }

    const isMatch = await compareOtp(code, otp.codeHash);
    if (!isMatch) {
         otp.attempts += 1;
         await otp.save();
        throw ApiError.badRequest("Invalid OTP code.");
    }

    otp.consumedAt = new Date();
    await otp.save();

    return otp;
};

const issueTokenPair = async (user: User, meta: RequestMeta) => {
    const access = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refresh = signRefreshToken(user.id);
    await RefreshToken.create({
        userId: user.id,
        tokenHash: hashToken(refresh.token),
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

export const registerUser = async (input: { firstName: string; lastName: string; email: string; password: string;}) => {

    const existing = await User.findOne({ where: { email: input.email } });
    if (existing) {
        if(existing.isEmailVerified) {
            throw new ApiError(409, "User with this email already exists.");
        }
        
        existing.firstName = input.firstName;
        existing.lastName = input.lastName;
        existing.password = await hashPassword(input.password);
        await existing.save();
        
        const code = await issueOtp(existing.id, "email_verification");
        logger.info(`Use this for your OTP Code ${code}`)
        // await sendOtpEmail({
        //     to: existing.email,
        //     firstName: existing.firstName,
        //     code,
        //     purpose: "email_verification", 
        // });
        return existing?.toSafeJSON()
    };

    const user = await User.create({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    password: await hashPassword(input.password),
});

const code = await issueOtp(user.id, "email_verification");
logger.info(`Use this for your OTP Code ${code}`)
// await sendOtpEmail({
//     to: user.email,
//     firstName: user.firstName,
//     code,
//     purpose: "email_verification",
// });

return user.toSafeJSON();
};

export const loginUser = async (input: { email: string; password: string }, meta: RequestMeta) => {
    const user = await User.scope("withPassword").findOne({ where: { email: input.email } });
    if (!user || !(await comparePassword(input.password, user.password))) {
        throw new ApiError(401, "Invalid email or password.");
    }
    if (!user.isActive) {
        throw new ApiError(401, "User account is deactivated.");
    }
    if (!user.isEmailVerified) {
        throw ApiError.unauthorized("Email is not verified. Please verify your email before logging in.");
    }

    const tokens = await issueTokenPair(user, meta);

    user.lastLoginAt = new Date();
    await user.save();
    return { user: user.toSafeJSON(), ...tokens };
}; 

export const verifyOtp = async (input: { email: string; code: string, purpose: OtpPurpose}) => {
    const user = await User.findOne({ where: { email: input.email } }); 
    if (!user) {
        throw ApiError.badRequest('Invalid email or OTP.');
    }
    await consumeOtp(user.id, input.purpose, input.code);

    if (input.purpose === "email_verification") {
        user.isEmailVerified = true;
        await user.save();
        return { type: "email_verified" as const, user: user.toSafeJSON() };
    }

    const resetToken = signPasswordResetToken(user.id);
    return { type: "password_reset_token" as const, resetToken };
};
 export const resendOtp = async (input: { email: string; purpose: OtpPurpose }):Promise<void> => {
    const user = await User.findOne({ where: { email: input.email } });

    if(input.purpose === "email_verification") {
        if(!user) {
            throw ApiError.notFound("User with this email does not exist.");
        }
        if (user.isEmailVerified) {
            throw ApiError.badRequest("Email is already verified.");
        } else if (!user){
            return;
        }

        await assertOtpCoolDown(user.id, input.purpose);
        const code = await issueOtp(user.id, input.purpose);
        logger.info(`Use this for your OPT Code ${code}`)
        // await sendOtpEmail({
        //     to: user.email,
        //     firstName: user.firstName,
        //     code,
        //     purpose: input.purpose,
        // });
    } 
};

export const forgotPassword = async (email: string): Promise<void> => {
    const user = await User.findOne({ where: {email}});
    if(!user)  return;

    await assertOtpCoolDown(user.id, "password_reset");
    const code = await issueOtp(user.id, "password_reset");
   // await sendOtpEmail({to: user.email, firstName: user.firstName, code, purpose: "password_reset"});
};

export const resetPassword = async (input: {resetToken: string, newPassword: string }):Promise<void> => {
    let payload;
    try{
        payload = verifyPasswordResetToken(input.resetToken)
    } catch (error) {
        if (error instanceof TokenExpiredError){
            throw ApiError.unauthorized("reset link has expired")
        } if (error instanceof JsonWebTokenError){
            throw ApiError.unauthorized("Invalid reset Token")
        }
        throw error;
    }

    const user = await User.findByPk(payload.sub);
    if(!user) {
        throw ApiError.unauthorized("Invalid reset Token");
    }

    user.password = await hashPassword(input.newPassword);
    await user.save();

    await RefreshToken.update({ revokedAt: new Date()}, { where: {userId: user.id, revokedAt: null}});
   // await sendPasswordChangedEmail({ to: user.email, firstName: user.firstName});
};

export const refreshTokens =  async (rawRefreshToken: string, meta: RequestMeta) => {
    let payload;
    try {
        payload = verifyRefreshToken(rawRefreshToken);
    } catch (error) {
        if (error instanceof TokenExpiredError){
            throw ApiError.unauthorized("refresh token has expired, login again!!")
        }
        if (error instanceof JsonWebTokenError){
            throw ApiError.unauthorized("invalid refresh token")
        }
        throw error;
    }

    const tokenHash =  hashToken(rawRefreshToken);
    const record = await RefreshToken.findOne({ where: { tokenHash }});
    if (!record) {
        throw ApiError.unauthorized("invalid refresh token")
    }

    if (record.revokedAt){
        //re-use of an already revoked function suggests theft, burn every session for this user.

        await RefreshToken.update(
            {revokedAt: new Date()},
            {where: { userId: record.userId, revokedAt: null}}
        );
        logger.warn("Refresh token reuse detected - all sessions revoked", { userId: record.userId});
        throw ApiError.unauthorized("session invalidated, please log in again")
    }

    if (record.expiresAt.getTime() < Date.now()){
        throw ApiError.unauthorized("Refresh token has expired, please log in again")
    }

    const user = await User.findByPk(record.userId);
    if (!user || !user.isActive) {
        throw ApiError.unauthorized("Account is no longer acitve")
    }

    const tokens = await issueTokenPair(user, meta);

    record.revokedAt = new Date();
    record.replacedByTokenHash = hashToken(tokens.refreshToken);
    await record.save();

    return { user: user.toSafeJSON(), ...tokens }
};


export const logOutUser = async (
    rawRefreshToken: string,
    accessTokenPayload: AccessTokenPayload
): Promise<void> => {
    const tokenHash = hashToken(rawRefreshToken);
    await RefreshToken.update({ revokedAt: new Date() }, { where: { tokenHash, revokedAt: null } });
    if(accessTokenPayload.exp){
        await BlacklistedToken.findOrCreate({
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
                                                                                                                                                        
export const getProfile = async (userId: string) => {
    const user =  await User.findByPk(userId);
    if (!user){
        throw ApiError.notFound("User not found");
    }
    return user.toSafeJSON(); 
}

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




import crypto from "crypto"
import jwt, {SignOptions} from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import { config } from "../config/env"
import { UserRole } from "../models/User"

export interface AccessTokenPayload {
    sub: string;
    email: string;
    role: UserRole;
    jti: string;
    iat?: number;
    exp?: number;
}

export interface RefreshTokenPayload {
    sub: string;

    jti: string;
}

export interface RefreshTokenPayload {
    sub: string;
    jti: string;
}

export interface PasswordResetTokenPayload {
    sub: string;
    purpose: "password-reset";
    jti: string;
}

export interface IssuedAccessToken {
    token: string;
    jti: string;
    expiresAt: Date;
}

export interface IssuedRefreshToken {
    token: string;
    jti: string;
    expiresAt: Date;

}

// export interface IssuedRefreshToken {
//     token: string;
//     jti: string;
//     expiresAt: Date;
// }

const decodeExpiry = (token: string): Date => {
    const decoded = jwt.decode(token) as {exp?: number } | null;
    if (!decoded?.exp) {
        throw new Error("Unable to determine token expiry");
    }
    return new Date(decoded.exp * 1000);
};

export const signAccessToken = (user: {id: string; email: string; role: UserRole}): IssuedAccessToken=>{
    const jti = uuidv4();
    const payload: AccessTokenPayload = {sub: user.id, email: user.email, role: user.role, jti};
    const token = jwt.sign(payload, config.jwt.accesssecret, {
        expiresIn: config.jwt.refreshexpiresIn,
    } as SignOptions);

    return {token, jti, expiresAt: decodeExpiry(token)};
};

export const verifyAccessToken = (token: string): AccessTokenPayload =>
    jwt.verify(token, config.jwt.accesssecret) as AccessTokenPayload;

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
    jwt.verify(token, config.jwt.refreshsecret) as RefreshTokenPayload;

export const signPasswordResetToken = (userId: string): string => {
    const payload: PasswordResetTokenPayload = {sub: userId, purpose: "password-reset", jti: uuidv4()};
    return jwt.sign(payload, config.jwt.resetsecret, {
        expiresIn: config.jwt.resetexpiresIn,
    } as SignOptions);
};

export const signRefreshToken = (userId: string): IssuedRefreshToken => {
    const jti = uuidv4();
    const payload: RefreshTokenPayload = { sub: userId, jti };
    const token = jwt.sign(payload, config.jwt.refreshsecret, {
        expiresIn: config.jwt.refreshexpiresIn,
    } as SignOptions);
    return { token, jti, expiresAt: decodeExpiry(token) };
};


export const verifyPasswordResetToken = (token: string): PasswordResetTokenPayload => 
    jwt.verify(token, config.jwt.resetsecret) as PasswordResetTokenPayload;

/**
 * Refresh tokens are high-entropy JWTs, so a fast deterministic hash(rather than bcrypt)
 * is sufficient, it lets us index-lookup the token in the DB without ever storing it in plaintext
 */

export const hashToken = (token: string): string => crypto.createHash("sha256").update(token).digest("hex");

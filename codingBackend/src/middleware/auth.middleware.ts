import { NextFunction, Request, Response } from "express";
import { TokenExpiredError, JsonWebTokenError, verify } from "jsonwebtoken";
import { ApiError } from "../utils/apiError";
import { catchAsync } from "../utils/catchAsync";
import { BlacklistedToken, User, UserRole } from "../models/index";
import { AccessTokenPayload, verifyAccessToken } from "../helper/tokenHelper";
// type AccessTokenPayload = {
//     sub: string;
//     jti: string;
//     iat: number;
//     exp: number;
// };

declare global {
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}


const extractBearerToken = (req: Request): string => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        throw ApiError.unauthorized("Authorization header missing", 401);
    }
    return header.slice("Bearer ".length).trim();
};

export const authenticate = catchAsync(async (req: Request, _res: Response, next: NextFunction) =>{
    const token = extractBearerToken(req);
    let payload: AccessTokenPayload;

    try{
        payload = verifyAccessToken(token);
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            throw ApiError.unauthorized("Access token expired", 401);
        }
        if (error instanceof JsonWebTokenError) {
            throw ApiError.unauthorized("Invalid access token", 401);
        }
        throw error;
    }

const blacklistedToken = await BlacklistedToken.findOne({ where: { jti: payload.jti } });
if (blacklistedToken) {
    throw ApiError.unauthorized("Token has been revoked", 401);
}



    const user = await User.findByPk(payload.sub);
    if (!user || !user) {
        throw ApiError.unauthorized("Account is no longer active", 401);
    }

    req.user = payload;
    next();
});


export const authorize = (...roles: UserRole[]) => (
req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(ApiError.unauthorized("User not authenticated", 401));
    }

    if (roles.length && !roles.includes(req.user.role)) {
        return next(ApiError.forbidden("You do not have permission to access this resource", 403));
    }

    next();
};

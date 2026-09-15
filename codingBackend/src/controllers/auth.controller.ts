import { Request, Response} from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import * as authService from "../services/auth.service";

const requestMeta = (req: Request) => ({
    userAgent: req.headers["user-agent"] ?? null,
    ipAddress: req.ip ?? null,
});

export const register =  catchAsync( async (req: Request, res: Response) => {
    const user = await authService.registerUser(req.body);
    sendSuccess(res, {
        statusCode: 201,
        message: "Registration successful. Please check your email for a verification code.",
        data: { user },
    });
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.loginUser(req.body, requestMeta(req));
    sendSuccess(res, { message: "login successful", data: result });
});

export const verifyOtp =  catchAsync( async(req: Request, res: Response) => {
    const result =  await authService.verifyOtp(req.body);

    if (result.type === "email_verified"){
        return sendSuccess(res, { message: "Email verified successfully", data: { user: result.user }});

    }

    sendSuccess(res, {
        message: "Code verified. use the reset token to set a new password.",
        data: { resetToken: result.resetToken},
    });
});

export const resendOtp = catchAsync(async(req: Request, res: Response) => {
    await authService.resendOtp(req.body);
    sendSuccess(res, {message: "If eleigible, a new code has been sent to yout email"})
});

export const forgotPassword =  catchAsync(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, { message: "If an account with that email exists, a reset code has been sent"})
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body);
    sendSuccess(res, {message: "Password has been reset successfully. Please log in with your new password"})
});

export const refreshToken = catchAsync(async( req: Request, res: Response) => {
    const result =  await authService.refreshTokens(req.body.refreshToken, requestMeta(req));
    sendSuccess(res, { message: "Token refreshed successfully", data: result });
});


export const logout = catchAsync(async( req: Request, res: Response) => {
    if(!req.user){
        throw ApiError.unauthorized();
    }
    await authService.logOutUser(req.body.refreshToken, req.user);
    sendSuccess(res, {message: "logged out successfully"});
});

export const me = catchAsync(async (req: Request, res: Response) => {
    if(!req.user){
        throw ApiError.unauthorized();
    }
    const user =  await authService.getProfile(req.user.sub);
    sendSuccess(res, {message: "Profile retrieved successfully", data: {user}});
});

// export const getApiLogs = catchAsync(async (req: Request, res: Response) => {
//     const logs = await authService.getApiLogs();
//     sendSuccess(res, { message: "API logs retrieved successfully", data: { logs } });
// });

// export const updatePassword = catchAsync(async (req: Request, res: Response) => {
//     await authService.updatePassword(req.body.password);
//     sendSuccess(res, { message: "Password set successfully"} )
//     });
    
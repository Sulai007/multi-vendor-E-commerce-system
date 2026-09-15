import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../utils/apiResponse";
import * as logService from "../services/logService";

export const getApiLogs = catchAsync(async (req: Request, res: Response) => {
    const logs = await logService.getApiLogs();
    sendSuccess(res, { message: "API logs retrieved successfully", data: { logs } });
});

export const updatePassword = catchAsync(async (req: Request, res: Response) => {
    await logService.updatePassword(req.body.password);
    sendSuccess(res, { message: "Password set successfully"} )
    });

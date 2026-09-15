import {Response} from "express";

export interface ApiSuccessBody<T> {
    success: true;
    message: string;
    data?: T;
}

export const sendSuccess = <T>(
    res: Response, 
    {statusCode = 200, message, data }: {statusCode?: number; message: string; data?: T}
): Response => {
    const body: ApiSuccessBody<T> = {
        success: true,
        message};
        if (data !== undefined) {
            body.data = data;
        }
        return res.status(statusCode).json(body)
    }
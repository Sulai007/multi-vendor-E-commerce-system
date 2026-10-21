import {Response} from "express";
import { PaginationMetadata } from "./pagination";

export interface ApiSuccessBody<T> {
    success: true;
    message: string;
    data?: T;
    pagination?: PaginationMetadata;
}

export const sendSuccess = <T>(
    res: Response, 
    {statusCode = 200, message, data, pagination }: {
        statusCode?: number;
        message: string;
        data?: T;
        pagination?: PaginationMetadata;
    }
): Response => {
    const body: ApiSuccessBody<T> = {
        success: true,
        message};
        if (data !== undefined) {
            body.data = data;
        }
        if (pagination !== undefined) {
            body.pagination = pagination;
        }
        return res.status(statusCode).json(body)
    }
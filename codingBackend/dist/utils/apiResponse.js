"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = void 0;
const sendSuccess = (res, { statusCode = 200, message, data, pagination }) => {
    const body = {
        success: true,
        message
    };
    if (data !== undefined) {
        body.data = data;
    }
    if (pagination !== undefined) {
        body.pagination = pagination;
    }
    return res.status(statusCode).json(body);
};
exports.sendSuccess = sendSuccess;

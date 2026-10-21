"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.getApiLogs = void 0;
const triggeredApi_1 = require("../models/triggeredApi");
const passwordHelper_1 = require("../helper/passwordHelper");
const models_1 = require("../models");
const pagination_1 = require("../utils/pagination");
const getApiLogs = async (pageValue, limitValue) => {
    const { page, limit, offset } = (0, pagination_1.getPagination)(pageValue, limitValue);
    const result = await triggeredApi_1.apiLogs.findAndCountAll({
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });
    return {
        items: result.rows.map(log => ({
            id: log.id,
            userId: log.userId,
            method: log.method,
            statusCode: log.statusCode,
            ipAddress: log.ipAddress,
            time: log.createdAt.toISOString(),
        })),
        pagination: (0, pagination_1.getPaginationMetadata)(page, limit, result.count),
    };
};
exports.getApiLogs = getApiLogs;
const updatePassword = async (newPassword) => {
    const hashedPassword = await (0, passwordHelper_1.hashPassword)(newPassword);
    await models_1.appSetting.upsert({
        key: "admin_password",
        value: hashedPassword,
    });
    return { message: "Password set successfully" };
};
exports.updatePassword = updatePassword;

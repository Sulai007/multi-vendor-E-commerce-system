"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePassword = void 0;
const accessPasword_1 = require("../models/accessPasword");
const bcrypt_1 = __importDefault(require("bcrypt"));
const apiError_1 = require("../utils/apiError");
const requirePassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        if (!password) {
            throw apiError_1.ApiError.badRequest("Password is required");
        }
        try {
            const setting = await accessPasword_1.appSetting.findOne({ where: { key: "admin_password" } });
            if (!setting) {
                throw apiError_1.ApiError.internalServerError("Admin password setting not found");
            }
            const isMatch = await bcrypt_1.default.compare(password, setting.value);
            if (!isMatch) {
                throw apiError_1.ApiError.unauthorized("Invalid password");
            }
            next();
        }
        catch (error) {
            throw apiError_1.ApiError.internalServerError("Error occurred while validating password");
        }
    }
    catch (error) {
        next(error);
    }
};
exports.requirePassword = requirePassword;

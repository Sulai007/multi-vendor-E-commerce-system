import {Request, Response, NextFunction} from 'express';
import { appSetting } from '../models/accessPasword';
import bcrypt from 'bcrypt';
import { ApiError } from '../utils/apiError';

export const requirePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { password } = req.body;
        if(!password){
            throw ApiError.badRequest("Password is required");
        }
        try {
            const setting = await appSetting.findOne({ where: { key: "admin_password" } });
            if (!setting) {
                throw ApiError.internalServerError("Admin password setting not found");
            }
            const isMatch = await bcrypt.compare(password, setting.value);
            if (!isMatch) {
                throw ApiError.unauthorized("Invalid password");
            }
            next();
        } catch (error) {
            throw ApiError.internalServerError("Error occurred while validating password");
        }
    } catch (error) {
        next(error);
    }
};
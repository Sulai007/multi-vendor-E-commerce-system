import { apiLogs } from "../models/triggeredApi";
import { hashPassword } from "../helper/passwordHelper";
import { appSetting } from "../models";
import { time } from "console";

export const getApiLogs = async () => {
    const logs = await apiLogs.findAll({
        order: [["createdAt", "DESC"]]});

        return logs.map(log => ({
            id: log.id,
            userId: log.userId,
            
            method: log.method,
            statusCode: log.statusCode,
            ipAddress: log.ipAddress,
            time: log.createdAt.toISOString(),

        }));
    };




export const updatePassword = async (newPassword: string) => {
    const hashedPassword = await hashPassword(newPassword);

    await appSetting.upsert({
        key: "admin_password",
        value: hashedPassword,
    });


    return { message: "Password set successfully" };

};
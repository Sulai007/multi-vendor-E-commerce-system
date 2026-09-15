import bcrypt from "bcrypt";
import crypto from "crypto";
import { config } from "../config/env"


export const generateOtpCode = (): string => {
    const max = 10 ** config.otp.length;
    const min = 10 ** (config.otp.length - 1);
    const value = crypto.randomInt(min, max);
    return value.toString().padStart(config.otp.length, "0");
};

export const hashOtp = (code: string): Promise<string> => bcrypt.hash(code, config.bcrypt.saltRounds);
export const compareOtp = (code: string, hash: string): Promise<boolean> => bcrypt.compare(code, hash);

export const otpExpiryDate = (): Date => 
    new Date(Date.now() + config.otp.expiresInMinutes * 60 * 1000);

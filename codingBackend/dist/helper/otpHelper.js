"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpExpiryDate = exports.compareOtp = exports.hashOtp = exports.generateOtpCode = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const generateOtpCode = () => {
    const max = 10 ** env_1.config.otp.length;
    const min = 10 ** (env_1.config.otp.length - 1);
    const value = crypto_1.default.randomInt(min, max);
    return value.toString().padStart(env_1.config.otp.length, "0");
};
exports.generateOtpCode = generateOtpCode;
const hashOtp = (code) => bcrypt_1.default.hash(code, env_1.config.bcrypt.saltRounds);
exports.hashOtp = hashOtp;
const compareOtp = (code, hash) => bcrypt_1.default.compare(code, hash);
exports.compareOtp = compareOtp;
const otpExpiryDate = () => new Date(Date.now() + env_1.config.otp.expiresInMinutes * 60 * 1000);
exports.otpExpiryDate = otpExpiryDate;

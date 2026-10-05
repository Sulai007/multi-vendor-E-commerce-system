"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_POLICY_MESSAGE = exports.isStrongPassword = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = require("../config/env");
const hashPassword = (plainPassword) => bcrypt_1.default.hash(plainPassword, env_1.config.bcrypt.saltRounds);
exports.hashPassword = hashPassword;
const comparePassword = (plainPassword, hash) => bcrypt_1.default.compare(plainPassword, hash);
exports.comparePassword = comparePassword;
const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const isStrongPassword = (password) => PASSWORD_POLICY_REGEX.test(password);
exports.isStrongPassword = isStrongPassword;
exports.PASSWORD_POLICY_MESSAGE = "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.";

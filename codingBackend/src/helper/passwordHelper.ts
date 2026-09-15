import bcrypt from "bcrypt";
import { config } from "../config/env";

export const hashPassword = (plainPassword: string): Promise<string> =>
    bcrypt.hash(plainPassword, config.bcrypt.saltRounds);
export const comparePassword = (plainPassword: string, hash: string): Promise<boolean> =>
    bcrypt.compare(plainPassword, hash);
const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
export const isStrongPassword = (password: string): boolean => PASSWORD_POLICY_REGEX.test(password);

export const PASSWORD_POLICY_MESSAGE = "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.";

import path from "path";
import dotenv from "dotenv"
import { z } from "zod";
import { is } from "zod/v4/locales";

dotenv.config({ path: path.resolve(process.cwd(), ".env")});
const envBoolean = z.preprocess(
    (value) => (typeof value === "string" ? value.toLowerCase() === "true" : value),
    z.boolean()

    
)

const envSchema = z.object(
    {
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
        PORT: z.coerce.number().int().positive().default(3000),
        APP_NAME: z.string().default("My Coding Api"),
        API_BASE_URL: z.string().default("http://localhost:3000"),
        CORS_ORIGIN: z.string().default("*"),

        DB_HOST: z.string().min(1, "DB_HOST is required"),
        DB_PORT: z.coerce.number().int().positive().default(5432),
        DB_NAME: z.string().min(1, "DB_NAME is required"),
        DB_USER: z.string().min(1, "DB_USER is required"),
        DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
        DB_SSL: envBoolean.default(false),
        DB_LOGGING: envBoolean.default(false),

        JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
        JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
        JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET is required"),
        JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
        JWT_RESET_SECRET: z.string().min(16, "JWT_RESET_SECRET must be at least 16 characters"),
        JWT_RESET_EXPIRES_IN: z.string().default("10m"),

        BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),

        OTP_LENGTH: z.coerce.number().int().min(4).max(10).default(6),
        OTP_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(10),
        OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
        OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().nonnegative().default(60),


        SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
        SMTP_PORT: z.coerce.number().int().positive().default(587),
        SMTP_USER: z.string().min(1, "SMTP_USER is required"),
        SMTP_PASSWORD: z.string().min(1, "SMTP_PASSWORD is required"),
        SMTP_SECURE: envBoolean.default(false),
        MAIL_FROM_NAME: z.string().default("My Coding Api"),
        MAIL_FROM_ADDRESS: z.email("MAIL_FROM_ADDRESS must be a valid email address"),

        CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
        CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
        CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
    }
);

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables, Kindly check your .env file against .env.example file");
}

const env = parsed.data;
export const config = {
    isProduction: env.NODE_ENV === "production",
    isDevelopment: env.NODE_ENV === "development",
    isTest: env.NODE_ENV === "test",
    port: env.PORT, 
    appName: env.APP_NAME,
    apiBaseUrl: env.API_BASE_URL,
    corsOrigins: env.CORS_ORIGIN.split(",").map(origin => origin.trim()),
    db: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        name: env.DB_NAME,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        ssl: env.DB_SSL,
        logging: env.DB_LOGGING,
    },
    jwt: {
            accesssecret: env.JWT_ACCESS_SECRET,
            accessexpiresIn: env.JWT_ACCESS_EXPIRES_IN,
            refreshsecret: env.JWT_REFRESH_SECRET,
            refreshexpiresIn: env.JWT_REFRESH_EXPIRES_IN,
            resetsecret: env.JWT_RESET_SECRET,
            resetexpiresIn: env.JWT_RESET_EXPIRES_IN,
    },
    bcrypt: {
        saltRounds: env.BCRYPT_SALT_ROUNDS,
    },
    otp: {
        length: env.OTP_LENGTH,
        expiresInMinutes: env.OTP_EXPIRES_IN_MINUTES,
        maxAttempts: env.OTP_MAX_ATTEMPTS,
        resendCooldownSeconds: env.OTP_RESEND_COOLDOWN_SECONDS,
    },
    smtp: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        user: env.SMTP_USER,
        password: env.SMTP_PASSWORD,
        secure: env.SMTP_SECURE,
        from: {
            name: env.MAIL_FROM_NAME,
            address: env.MAIL_FROM_ADDRESS,
        },
    },

    cloudinary: {
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        apiKey: env.CLOUDINARY_API_KEY,
        apiSecret: env.CLOUDINARY_API_SECRET,
    },
} as const;

export type AppConfig = typeof config;



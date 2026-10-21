"use strict";
// import Redis from "ioredis";
// import { logger } from "../utils/logger";
// import { config } from "./env";
Object.defineProperty(exports, "__esModule", { value: true });
// const REDIS_URL = config.redis.url;
// const redis = new Redis(REDIS_URL, {
//   // Don't connect on import — we call redis.connect() explicitly in server.ts
//   lazyConnect: true,
//   tls: {},
//   maxRetriesPerRequest: 3,
//   enableReadyCheck: true,
//   connectTimeout: 10_000,
//   commandTimeout: 5_000,
//   // Exponential back-off capped at 3 s; stop after 10 failed attempts
//   retryStrategy: (times: number) => {
//     if (times > 10) return null;
//     return Math.min(times * 200, 3_000);
//   },
//   // Auto-reconnect on transient errors
//   reconnectOnError: (err: Error) => {
//     return ["READONLY", "ETIMEDOUT", "ECONNRESET"].some((e) =>
//       err.message.includes(e)
//     );
//   },
// });
// redis.on("connect",     () => logger.info("Redis connecting..."));
// redis.on("ready",       () => logger.info("Redis ready"));
// redis.on("error",       (err: Error) => logger.error("Redis error", { error: err.message }));
// redis.on("close",       () => logger.warn("Redis connection closed"));
// redis.on("reconnecting",() => logger.warn("Redis reconnecting..."));
// redis.on("end",         () => logger.warn("Redis connection ended"));
// export default redis;
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
const env_1 = require("./env");
const redis = (0, redis_1.createClient)({
    url: env_1.config.redis.url,
    socket: {
        // How long to wait when establishing a connection
        connectTimeout: 30000,
        // Retry dropped connections, up to 10 times
        reconnectStrategy: (retries, cause) => {
            if (retries >= 10) {
                return new Error(`Redis reconnect limit reached: ${cause.message}`);
            }
            // Back off between retries, capped at 5 seconds
            return Math.min((retries + 1) * 500, 5000);
        },
    },
    // Maximum time to wait for a command to complete
    commandOptions: {
        timeout: 15000,
    },
});
redis.on("connect", () => logger_1.logger.info("Redis connecting..."));
redis.on("ready", () => logger_1.logger.info("Redis ready"));
redis.on("error", (err) => logger_1.logger.error("Redis error", { error: err.message }));
redis.on("close", () => logger_1.logger.warn("Redis connection closed"));
redis.on("reconnecting", () => logger_1.logger.warn("Redis reconnecting..."));
redis.on("end", () => logger_1.logger.warn("Redis connection ended"));
exports.default = redis;

// import Redis from "ioredis";
// import { logger } from "../utils/logger";
// import { config } from "./env";


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

import { createClient } from "redis";
import { logger } from "../utils/logger";
import { config } from "./env";

const redis = createClient({
  url: config.redis.url,
  socket: {
    // How long to wait when establishing a connection
    connectTimeout: 30_000,

    // Retry dropped connections, up to 10 times
    reconnectStrategy: (retries, cause) => {
      if (retries >= 10) {
        return new Error(`Redis reconnect limit reached: ${cause.message}`);
      }

      // Back off between retries, capped at 5 seconds
      return Math.min((retries + 1) * 500, 5_000);
    },
  },

  // Maximum time to wait for a command to complete
  commandOptions: {
    timeout: 15_000,
  },
});

redis.on("connect", () => logger.info("Redis connecting..."));
redis.on("ready", () => logger.info("Redis ready"));
redis.on("error", (err: Error) => logger.error("Redis error", { error: err.message }));
redis.on("close", () => logger.warn("Redis connection closed"));
redis.on("reconnecting", () => logger.warn("Redis reconnecting..."));
redis.on("end", () => logger.warn("Redis connection ended"));

export default redis;
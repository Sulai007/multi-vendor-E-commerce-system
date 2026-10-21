"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
require("./models");
const logger_1 = require("./utils/logger");
const errorHandler_middleware_1 = require("./middleware/errorHandler.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const vendorRoute_1 = __importDefault(require("./routes/vendorRoute"));
const customerRoute_1 = __importDefault(require("./routes/customerRoute"));
const swagger_1 = require("./docs/swagger");
const sequelizeTransport_1 = require("./utils/sequelizeTransport");
const triggeredEndpoint_1 = require("./middleware/triggeredEndpoint");
const redis_1 = __importDefault(require("./config/redis"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.config.corsOrigins.includes("*") ? true : env_1.config.corsOrigins,
    credentials: true
}));
const PORT = 3000;
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.set("trust proxy", 1);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.use(triggeredEndpoint_1.endPointLogger);
app.get("/", (_req, res) => {
    res.send("OK");
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/business", vendorRoute_1.default);
app.use("/api/customer", customerRoute_1.default);
app.use(errorHandler_middleware_1.notFoundHandler);
app.use(errorHandler_middleware_1.errorHandler);
let server;
const start = async () => {
    await (0, db_1.connectDB)();
    logger_1.logger.add(new sequelizeTransport_1.SequelizeTransport({ logModel: db_1.sequelize.models.apiLogs }));
    //await verifyMailerConnection();
    await redis_1.default.connect();
    const redisPing = await redis_1.default.ping();
    if (redisPing !== "PONG") {
        throw new Error(`Unexpected Redis ping response: ${redisPing}`);
    }
    logger_1.logger.info("Redis ping/pong check succeeded");
    server = app.listen(env_1.config.port, () => {
        logger_1.logger.info(`Server is running on http://localhost:${env_1.config.port}`);
        logger_1.logger.info(`swagger docs is running at http://localhost:${env_1.config.port}/api-docs}`);
    });
};
start().catch((error) => {
    logger_1.logger.error("Failed to start server", { error });
    process.exit(1);
});
const shutdown = (signal) => {
    logger_1.logger.info(`${signal} received. Shutting down gracefully.... `);
    server?.close(async () => {
        await db_1.sequelize.close();
        logger_1.logger.info("server and DB connection closed.");
        process.exit(0);
    });
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
    logger_1.logger.error("Unhandled promise rejection", { reason });
});
exports.default = app;
// app.listen(PORT, () =>{
//     console.log(`server is running on http://localhost:${PORT}`)
//     console.log(`swagger docs is running at https://localhost:${PORT}/api-docs`)
// });

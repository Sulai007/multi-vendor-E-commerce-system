"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
exports.sequelize = new sequelize_1.Sequelize(env_1.config.db.name, env_1.config.db.user, env_1.config.db.password, {
    host: env_1.config.db.host,
    port: env_1.config.db.port,
    dialect: "postgres",
    logging: env_1.config.db.logging ? (sql) => logger_1.logger.debug(sql) : false,
    dialectOptions: env_1.config.db.ssl ? {
        ssl: {
            require: true,
            rejectUnauthorized: false
        },
    } : {},
    define: {
        underscored: true,
        timestamps: true,
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
const connectDB = async () => {
    try {
        await exports.sequelize.authenticate();
        logger_1.logger.info("Database connection established successfully.");
        if (!env_1.config.isProduction) {
            await exports.sequelize.sync({ alter: true });
            logger_1.logger.info("Database models synchronized successfully.");
        }
    }
    catch (error) {
        logger_1.logger.error("Database connection failed:", error);
        throw error;
    }
};
exports.connectDB = connectDB;

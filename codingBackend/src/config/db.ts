import { Sequelize, Options } from "sequelize";  
import { config } from "./env";
import { logger } from "../utils/logger";

const options: Options = {
    logging: config.db.logging ? (sql: string) => logger.debug(sql) : false,
    dialectOptions: config.db.ssl ? {
        ssl: {
            require: true,
            rejectUnauthorized: false
        },
    } : {}
};

export const sequelize = config.db.url
    ? new Sequelize(config.db.url, options) :
 new Sequelize(config.db.name, config.db.user, config.db.password, {
    host: config.db.host,
    port: config.db.port,
    dialect: "postgres",
    ...options,
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

export const connectDB = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        logger.info("Database connection established successfully.");
        if(!config.isProduction) {
            await sequelize.sync({ alter: true });
            logger.info("Database models synchronized successfully.");
        }
    } catch (error) {
        logger.error("Database connection failed:", error);
        throw error;
    }
};

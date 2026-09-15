import express, {Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import {config} from "./config/env";
import {connectDB, sequelize } from "./config/db";
import "./models";
// import {verifyMailerConnection} from "./config/mailer";
import { logger } from "./utils/logger";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.middleware";
import authRoutes from "./routes/auth.routes";
import logRoutes from "./routes/log.routes";
import vendorRoutes from "./routes/vendorRoute";
import {swaggerSpec} from './docs/swagger'
import { SequelizeTransport } from "./utils/sequelizeTransport";
import { apiLogs } from "./models/triggeredApi";
import { endPointLogger } from "./middleware/triggeredEndpoint";

const app = express();


app.use(helmet());
app.use(
    cors({
        origin: config.corsOrigins,
        credentials: true

}));
const PORT = 3000;

app.use(express.json({ limit: "10kb"}));
app.use(express.urlencoded({ extended: true}));
app.set("trust proxy", 1)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use(endPointLogger);

app.get("/", (_req: Request, res: Response) => {
    res.send("OK");
});


app.use("/api/auth", authRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/business", vendorRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

let server: ReturnType<typeof app.listen>;

const start = async (): Promise<void> => {
    await connectDB();
    logger.add(new SequelizeTransport({ logModel: sequelize.models.apiLogs }) as any );
    // await verifyMailerConnection();

    server = app.listen(config.port, ()=> {
        logger.info(`Server is running on http://localhost:${config.port}`)
        logger.info(`swagger docs is running at http://localhost:${config.port}/api-docs}`)
    });
};

start().catch((error) => {
    logger.error("Failed to start server", {error});
    process.exit(1);
});

const shutdown = (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully.... `);
    server?.close(async () => {
        await sequelize.close();
        logger.info("server and DB connection closed.");
        process.exit(0);
    });
};

process.on("SIGTERM", ()=> shutdown("SIGTERM")); 
process.on("SIGINT", ()=> shutdown("SIGINT"));

process.on("unhandledRejection", (reason)=>{
    logger.error("Unhandled promise rejection", { reason });
});

export default app;


// app.listen(PORT, () =>{
//     console.log(`server is running on http://localhost:${PORT}`)
//     console.log(`swagger docs is running at https://localhost:${PORT}/api-docs`)
// });
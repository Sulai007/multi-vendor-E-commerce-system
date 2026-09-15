import Transport from "winston-transport";

export class SequelizeTransport extends Transport {
    private logModel: any;
    constructor(opts: any) {
        super(opts);
        this.logModel = opts.logModel; // Sequelize model for logging
    }
    log(info: any, callback: () => void) {
        setImmediate(() => {
            this.emit("logged", info);
        });

        if (
            info.ipAddress == null ||
            info.method == null ||
            info.path == null ||
            info.statusCode == null ||
            info.duration == null
        ) {
            callback();
            return;
        }

        const { level, message, ...meta } = info;
        this.logModel.create({
            level,
            message,
            ...meta
        }).catch((err: any) => {
            console.error("Failed to log to database:", err);
        });
        callback();
    }
};
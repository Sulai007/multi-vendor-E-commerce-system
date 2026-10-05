"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequelizeTransport = void 0;
const winston_transport_1 = __importDefault(require("winston-transport"));
class SequelizeTransport extends winston_transport_1.default {
    constructor(opts) {
        super(opts);
        this.logModel = opts.logModel; // Sequelize model for logging
    }
    log(info, callback) {
        setImmediate(() => {
            this.emit("logged", info);
        });
        if (info.ipAddress == null ||
            info.method == null ||
            info.path == null ||
            info.statusCode == null ||
            info.duration == null) {
            callback();
            return;
        }
        const { level, message, ...meta } = info;
        this.logModel.create({
            level,
            message,
            ...meta
        }).catch((err) => {
            console.error("Failed to log to database:", err);
        });
        callback();
    }
}
exports.SequelizeTransport = SequelizeTransport;
;

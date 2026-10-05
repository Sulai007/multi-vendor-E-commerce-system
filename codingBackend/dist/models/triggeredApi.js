"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLogs = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class apiLogs extends sequelize_1.Model {
}
exports.apiLogs = apiLogs;
apiLogs.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
    },
    ipAddress: {
        type: sequelize_1.DataTypes.STRING(64),
        allowNull: false,
    },
    method: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: false,
    },
    message: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    level: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: false,
    },
    path: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    statusCode: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    duration: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: db_1.sequelize,
    modelName: "apiLogs",
    tableName: "api_logs",
    underscored: true,
    indexes: [{ fields: ["user_id"] }],
});

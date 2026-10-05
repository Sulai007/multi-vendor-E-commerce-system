"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Idempotency = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Idempotency extends sequelize_1.Model {
}
exports.Idempotency = Idempotency;
Idempotency.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    key: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    scope: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    requestHash: {
        type: sequelize_1.DataTypes.STRING(64),
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("processing", "completed"),
        allowNull: false,
        defaultValue: "processing"
    },
    statusCode: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    responseData: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true
    },
    lockedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    completedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE
}, {
    sequelize: db_1.sequelize,
    modelName: "Idempotency",
    tableName: "idempotencies",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["scope", "key"]
        }
    ]
});

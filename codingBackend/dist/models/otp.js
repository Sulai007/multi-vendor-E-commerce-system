"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Otp = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Otp extends sequelize_1.Model {
}
exports.Otp = Otp;
Otp.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
    },
    codeHash: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    purpose: {
        type: sequelize_1.DataTypes.ENUM("email_verification", "password_reset"),
        allowNull: false,
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    consumedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    attempts: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: db_1.sequelize,
    modelName: "Otp",
    tableName: "otps",
    underscored: true,
    indexes: [{ fields: ["user_id", "purpose"] }],
});

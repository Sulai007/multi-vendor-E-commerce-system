"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlacklistedToken = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class BlacklistedToken extends sequelize_1.Model {
}
exports.BlacklistedToken = BlacklistedToken;
BlacklistedToken.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    jti: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        unique: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    reason: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: db_1.sequelize,
    modelName: "BlacklistedToken",
    tableName: "blacklisted_tokens",
    underscored: true,
    updatedAt: false,
    indexes: [{ fields: ["jti"], unique: true }]
});

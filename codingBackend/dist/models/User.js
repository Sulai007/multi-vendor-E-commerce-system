"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class User extends sequelize_1.Model {
    toSafeJSON() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            address: this.address,
            email: this.email,
            role: this.role,
            isEmailVerified: this.isEmailVerified,
            isActive: this.isActive,
            lastLoginAt: this.lastLoginAt,
            createdAt: this.createdAt,
        };
    }
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true },
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
        set(value) {
            this.setDataValue("email", value.trim().toLowerCase());
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    address: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    role: {
        type: sequelize_1.DataTypes.ENUM("user", "admin", "vendor"),
        allowNull: false,
        defaultValue: "user",
    },
    isEmailVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    lastLoginAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: db_1.sequelize,
    modelName: "User",
    tableName: "users",
    underscored: true,
    defaultScope: {
        attributes: { exclude: ["password"] }
    },
    scopes: {
        withPassword: {
            attributes: { include: ["password"] },
        },
    },
});

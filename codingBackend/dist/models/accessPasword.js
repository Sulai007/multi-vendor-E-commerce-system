"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appSetting = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class appSetting extends sequelize_1.Model {
}
exports.appSetting = appSetting;
appSetting.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    key: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    value: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: db_1.sequelize,
    modelName: "appSetting",
    tableName: "app_Settings",
    underscored: true,
    //indexes: [{ fields: ["user_id", "purpose"] }],
});

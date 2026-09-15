import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../config/db";



export class appSetting extends Model<InferAttributes<appSetting>,
    InferCreationAttributes<appSetting>
> {
    declare id: CreationOptional<string>;
    declare key: string;
    declare value: string;
    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;
}


appSetting.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        key: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        value: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "appSetting",
        tableName: "app_Settings",
        underscored: true,
        //indexes: [{ fields: ["user_id", "purpose"] }],

    }
);
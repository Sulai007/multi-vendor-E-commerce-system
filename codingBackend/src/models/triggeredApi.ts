import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../config/db";


export class apiLogs extends Model<InferAttributes<apiLogs>,
    InferCreationAttributes<apiLogs>
> {
    declare id: CreationOptional<string>;
    declare ipAddress: string;
    declare method: string;
    declare message: string;
    declare level: string;
    declare path: string;
    declare statusCode: number;
    declare duration: number;
    declare userId: CreationOptional<string | null>
    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;
}

apiLogs.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
           type: DataTypes.UUID,
              allowNull: true,
           references: { model: "users", key: "id" },
           onDelete: "SET NULL",
        },
        ipAddress: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
        method: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        level: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        path: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        statusCode: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
            createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
        },

    {
        sequelize,
        modelName: "apiLogs",
        tableName: "api_logs",
        underscored: true,
        indexes: [{fields: ["user_id"]}],
    }
);

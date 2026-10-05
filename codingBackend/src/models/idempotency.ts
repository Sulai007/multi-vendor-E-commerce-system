import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../config/db";

export type IdempotencyStatus = "processing" | "completed";

export class Idempotency extends Model<InferAttributes<Idempotency>, InferCreationAttributes<Idempotency>> {
    declare id: CreationOptional<string>;
    declare key: string;
    declare scope: string;
    declare requestHash: string;
    declare status: IdempotencyStatus;
    declare statusCode: number | null;
    declare responseData: unknown | null;
    declare lockedAt: Date;
    declare completedAt: Date | null;
    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;
}

Idempotency.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    key: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    scope: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    requestHash: {
        type: DataTypes.STRING(64),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("processing", "completed"),
        allowNull: false,
        defaultValue: "processing"
    },
    statusCode: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    responseData: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    lockedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
}, 
{
    sequelize,
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
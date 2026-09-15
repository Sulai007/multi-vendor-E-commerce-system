import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../config/db";

export type OtpPurpose = "email_verification" | "password_reset";

export class Otp extends Model<InferAttributes<Otp>,
    InferCreationAttributes<Otp>
> {
    declare id: CreationOptional<string>;
    declare userId: string;
    declare codeHash: string;
    declare purpose: OtpPurpose;
    declare expiresAt: Date;
    declare consumedAt: CreationOptional<Date | null>;
    declare attempts: CreationOptional<number>;
    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;
}


Otp.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "users", key: "id" },
            onDelete: "CASCADE",
        },
        codeHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        purpose: {
            type: DataTypes.ENUM("email_verification", "password_reset"),
            allowNull: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        consumedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        attempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "Otp",
        tableName: "otps",
        underscored: true,
        indexes: [{ fields: ["user_id", "purpose"] }],

    }
);
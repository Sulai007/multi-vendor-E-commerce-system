import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../config/db";

export class BlacklistedToken extends Model<InferAttributes<BlacklistedToken>,
    InferCreationAttributes<BlacklistedToken>
> {
    declare id: CreationOptional<string>;
    declare jti: string;
    declare userId: string;
    declare expiresAt: Date;
    declare reason: CreationOptional<string | null>;
    declare readonly createdAt: CreationOptional<Date>;
}

BlacklistedToken.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        jti: {
            type:  DataTypes.UUID,
            allowNull: false,
            unique: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "users", key: "id"},
            onDelete: "CASCADE",
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        reason: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "BlacklistedToken",
        tableName: "blacklisted_tokens",
        underscored: true,
        updatedAt: false,
        indexes: [{ fields: ["jti"], unique: true }]
    }
);
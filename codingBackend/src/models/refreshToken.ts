import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../config/db";


export class RefreshToken extends Model<InferAttributes<RefreshToken>,
    InferCreationAttributes<RefreshToken>
> {
    declare id: CreationOptional<string>;
    declare userId: string;
    declare tokenHash: string;
    declare expiresAt: Date;
    declare revokedAt: CreationOptional<Date | null>;
    declare replacedByTokenHash: CreationOptional<string>;
    declare userAgent: CreationOptional<string | null>;
    declare ipAddress: CreationOptional<string | null>;
    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;
}

RefreshToken.init(
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
        tokenHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        revokedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        replacedByTokenHash: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
        },
        userAgent:{
            type: DataTypes.STRING(500),
            allowNull: true,

        },
        ipAddress: {
            type: DataTypes.STRING(64),
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "RefreshToken",
        tableName: "refresh_tokens",
        underscored: true,
        indexes: [{fields: ["user_id"]}],
    }
);

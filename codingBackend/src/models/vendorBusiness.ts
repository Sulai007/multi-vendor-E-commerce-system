import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, StringDataType } from "sequelize";
import { sequelize } from "../config/db";
import type { BusinessStatus } from "../types/lifecycle";
import type { product } from "./product";


export class vendorBusiness extends Model<InferAttributes<vendorBusiness>,
    InferCreationAttributes<vendorBusiness>
> {
    declare businessId: CreationOptional<string>;
    declare userId: string;
    declare businessName: string;
    declare description: string;
    declare status: CreationOptional<BusinessStatus>;
    declare isVerified: CreationOptional<boolean>;
    //declare products?: product[];
    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;
}

vendorBusiness.init(
    {
        businessId: {
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
        businessName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("pending", "verified", "rejected", "suspended"),
            allowNull: false,
            defaultValue: "pending",
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "business",
        tableName: "vendor_Businesses",
        underscored: true,
        indexes: [{fields: ["user_id"]}],
    }
);

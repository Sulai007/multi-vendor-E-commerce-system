import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../config/db";


export class product extends Model<InferAttributes<product>,
    InferCreationAttributes<product>
> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare businessId: string;
    declare description: string;
    declare price: number;
    declare quantity: number;
    declare imageUrl: string;
    declare  imagePublicId: string;
    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;
}

product.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        businessId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "vendor_Businesses", key: "business_id" },
            onDelete: "CASCADE",
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        imagePublicId: {
             type: DataTypes.STRING(255),
            allowNull: true,
        },
       
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "product",
        tableName: "products",
        underscored: true,
        indexes: [{ fields: ["business_id"] }],
    }
);

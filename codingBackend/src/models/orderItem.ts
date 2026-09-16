import { Model, DataTypes, InferCreationAttributes, CreationOptional, InferAttributes } from "sequelize"
import { sequelize } from "../config/db"

export type itemStatus = "pending" | "shipped" | "delivered" 
export type refundStatus = "none" | "requested" | "processing" | "refunded" | "rejected"

export class OrderItem extends Model<InferAttributes<OrderItem>, InferCreationAttributes<OrderItem>>{
    declare id:  CreationOptional<string>;
    declare orderId: string;
    declare productId: string;
    declare businessId: string;
    declare name: string;
    declare quantity: number;
    declare unitPrice: number;
    declare itemStatus: CreationOptional<itemStatus>
    declare refundStatus: CreationOptional<refundStatus>
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>
}


OrderItem.init({
    id:
    {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    orderId:
    {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "orders", key: "id" }
    },
    productId:
    {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "products", key: "id"},
        onDelete: "CASCADE"
    },
    businessId:
    {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "vendor_Businesses", key: "business_id" },
        onDelete: "CASCADE"
    },
    name:
    {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity:
    {
        type: DataTypes.INTEGER,
        allowNull: false

    },
    unitPrice:
    {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    itemStatus:
    {
        type: DataTypes.ENUM("pending", "shipped", "delivered"),
        allowNull: false,
        defaultValue: "pending"
    },
    refundStatus:
    {
        type: DataTypes.ENUM("none", "requested", "processing", "refunded", "rejected"),
        allowNull: false,
        defaultValue: "none"
    },
    createdAt: DataTypes.DATE(),
    updatedAt: DataTypes.DATE()
},
{
    sequelize,
    modelName: "orderItem",
    tableName: "orderItems",
    underscored: true
})
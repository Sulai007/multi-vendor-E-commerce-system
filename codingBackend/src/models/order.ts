import { Model, InferAttributes, CreationOptional, DataTypes, InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/db";
import type { OrderStatus } from "../types/lifecycle";

export type orderStatus = OrderStatus;
export type paymentStatus = "unpaid" | "paid" | "refunded"



export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>>{
declare id: CreationOptional<string>; 
declare customerId: string;
declare totalAmount?: number;
declare orderStatus: CreationOptional<OrderStatus>;
declare paymentStatus: CreationOptional<paymentStatus>;
declare shippingAddress: string;
declare isCancelled: CreationOptional<boolean>;
declare cancelledAt: CreationOptional<Date | null>;
declare cancelReason: CreationOptional<string | null>;
declare readonly createdAt: CreationOptional<Date>;
declare readonly updatedAt: CreationOptional<Date>;
}

Order.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        customerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "users", key: "id"}
        },
        totalAmount:
        {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0.00,
        },
        orderStatus:
        {
            type: DataTypes.ENUM("pending","processed", "shipped", "delivered", "cancelled"),
            allowNull: false,
            defaultValue: "pending"
        },
        paymentStatus:
        {
            type: DataTypes.ENUM("unpaid", "paid"),
            allowNull: false,
            defaultValue: "unpaid"
        },
        shippingAddress:
        {
            type: DataTypes.STRING(256),
            allowNull: false,
        },
        isCancelled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        cancelledAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        cancelReason: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        createdAt: DataTypes.DATE(),
        updatedAt: DataTypes.DATE()
        
    },
    {
        sequelize,
        modelName: "Order",
        tableName: "orders",
        underscored: true
    }
)


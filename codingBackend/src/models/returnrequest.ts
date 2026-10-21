import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "../config/db";
import type { OrderItem } from "./orderItem";
import type { User } from "./User";

export class ReturnRequest extends Model<InferAttributes<ReturnRequest>, InferCreationAttributes<ReturnRequest>> {
	declare id: CreationOptional<string>;
	declare orderItemId: string;
	declare customerId: string;
	declare businessId: string;
	declare reasonNote: string;
	declare orderItem?: NonAttribute<OrderItem>;
	declare customer?: NonAttribute<User>;
	declare readonly createdAt: CreationOptional<Date>;
	declare readonly updatedAt: CreationOptional<Date>;
}

ReturnRequest.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		orderItemId: {
			type: DataTypes.UUID,
			allowNull: false,
			unique: true,
			references: { model: "orderItems", key: "id" },
			onDelete: "CASCADE",
		},
		customerId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: "users", key: "id" },
			onDelete: "CASCADE",
		},
		businessId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: "vendor_Businesses", key: "business_id" },
			onDelete: "CASCADE",
		},
		reasonNote: {
			type: DataTypes.STRING(1000),
			allowNull: false,
		},
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		sequelize,
		modelName: "returnRequest",
		tableName: "return_requests",
		underscored: true,
		indexes: [
			{ unique: true, fields: ["order_item_id"] },
			{ fields: ["business_id", "created_at"] },
			{ fields: ["customer_id"] },
		],
	},
);

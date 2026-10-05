import { Model, InferAttributes, CreationAttributes, InferCreationAttributes, DataTypes } from "sequelize";
import { sequelize } from "../config/db";

export class Category extends Model<InferAttributes<Category>, InferCreationAttributes<Category>> {
  declare id: string;
  declare category: string;
}

Category.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUID,
      primaryKey: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "categories",
    modelName: "category"
  }
);

import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../config/db";

export type UserRole = "user" | "admin" | "vendor";

export class 
User extends Model<InferAttributes<User>,
    InferCreationAttributes<User>
> {
    declare id: CreationOptional<string>;
    declare firstName: string;
    declare lastName: string;
    declare email: string;
    declare password: string;
    declare address: string;
    declare role: CreationOptional<UserRole>;
    declare isEmailVerified: CreationOptional<boolean>;
    declare isActive: CreationOptional<boolean>;
    declare lastLoginAt: CreationOptional<Date | null>;
    declare readonly createdAt: CreationOptional<Date>;
    declare readonly updatedAt: CreationOptional<Date>;
    toSafeJSON(){
    return{
        id: this.id,
        firstName: this.firstName,
        lastName: this.lastName,
        address: this.address,
        email: this.email,
        role: this.role,
        isEmailVerified: this.isEmailVerified,
        isActive: this.isActive,
        lastLoginAt: this.lastLoginAt,
        createdAt: this.createdAt,
    };
}
}



User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {notEmpty: true},
        },
        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {notEmpty: true},
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {notEmpty: true},
            set(value: string) {
                this.setDataValue("email", value.trim().toLowerCase())
            },
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: false

        },
        role: {
            type: DataTypes.ENUM("user", "admin", "vendor"),
            allowNull: false,
            defaultValue: "user",
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "User",
        tableName: "users",
        underscored: true,
        defaultScope: {
            attributes: { exclude: ["password"]}
        },
        scopes: {
            withPassword: {
                attributes: {include: ["password"]},
            },
        },
    }
);
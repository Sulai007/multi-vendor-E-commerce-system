import { sequelize } from "../config/db";
import { User } from "./User";
import { Otp } from "./otp";
import { RefreshToken } from './refreshToken';
import { BlacklistedToken } from "./blackListedToken";
import { apiLogs } from "./triggeredApi";
import { appSetting } from "./accessPasword";
import { product } from "./product"
import { vendorBusiness } from "./vendorBusiness"
import { Order } from "./order";
import { OrderItem } from "./orderItem";

User.hasMany(Otp, {foreignKey: "userId", as: "otps"});
Otp.belongsTo(User, {foreignKey: "userId", as: "user"});

// user and refresh token relationship


User.hasMany(RefreshToken, {foreignKey: "userId", as: "refreshTokens"});
RefreshToken.belongsTo(User, {foreignKey: "userId", as: "user"});

User.hasMany(BlacklistedToken, {foreignKey: "userId", as: "blacklistedToken"});
BlacklistedToken.belongsTo(User, { foreignKey: "userId", as: "user"});

User.hasMany(apiLogs, {foreignKey: "userId", as: "apiLogs"});
apiLogs.belongsTo(User, {foreignKey: "userId", as: "user"});

User.hasMany(vendorBusiness, {foreignKey: "userId", as: "vendorBusiness"})
vendorBusiness.belongsTo(User, {foreignKey: "userId", as: "user"})

vendorBusiness.hasMany(product, {foreignKey: "businessId", as: "product"})
product.belongsTo(vendorBusiness, {foreignKey: "businessId", as: "vendorBusiness"})

Order.hasMany(product, {foreignKey: "productId", as: "product"})
product.belongsTo


export {sequelize, User, Otp, RefreshToken, BlacklistedToken, apiLogs, appSetting, product, vendorBusiness, Order, OrderItem};
export type {UserRole} from"./User";
export type { OtpPurpose } from "./otp"

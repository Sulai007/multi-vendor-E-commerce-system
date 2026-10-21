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
import { Category } from "./productCategory"
import { Idempotency } from "./idempotency"
import { ReturnRequest } from "./returnrequest"

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

User.hasMany(Order, { foreignKey: "customerId", as: "orders" });
Order.belongsTo(User, { foreignKey: "customerId", as: "user" });

vendorBusiness.hasMany(product, {foreignKey: "businessId", as: "product"})
product.belongsTo(vendorBusiness, {foreignKey: "businessId", as: "vendorBusiness"})

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "orderItems" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

OrderItem.hasOne(ReturnRequest, { foreignKey: "orderItemId", as: "refundRequest" });
ReturnRequest.belongsTo(OrderItem, { foreignKey: "orderItemId", as: "orderItem" });
User.hasMany(ReturnRequest, { foreignKey: "customerId", as: "refundRequests" });
ReturnRequest.belongsTo(User, { foreignKey: "customerId", as: "customer" });
vendorBusiness.hasMany(ReturnRequest, { foreignKey: "businessId", as: "refundRequests" });
ReturnRequest.belongsTo(vendorBusiness, { foreignKey: "businessId", as: "business" });

product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" })
OrderItem.belongsTo(product, { foreignKey: "productId", as: "product"})


Category.belongsToMany( product, { through: "ProductCategory", foreignKey: "categoryId", as: "products" });
product.belongsToMany( Category, { through: "ProductCategory", foreignKey: "productId", as: "categories" });


export {sequelize, User, Otp, RefreshToken, BlacklistedToken, apiLogs, appSetting, product, vendorBusiness, Order, OrderItem, Category, Idempotency, ReturnRequest};
export type {UserRole} from"./User";
export type { OtpPurpose } from "./otp"

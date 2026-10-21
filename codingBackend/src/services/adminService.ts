import { Op } from "sequelize";
import { apiLogs } from "../models/triggeredApi";
import { hashPassword } from "../helper/passwordHelper";
import { appSetting, User, vendorBusiness, product, Order, OrderItem, ReturnRequest, sequelize } from "../models";
import { refundStatusTransitions, type BusinessStatus, type OrderStatus, type ProductStatus, type RefundStatus } from "../types/lifecycle";
import { getPagination, getPaginationMetadata } from "../utils/pagination";
import { ApiError } from "../utils/apiError";
import { sendEmailSafely } from "../email/mailDelivery";
import { sendBusinessApplicationDecisionEmail } from "../email/businessEmail";
import {
    sendAdminAccessPasswordChangedEmail,
    sendAdminRefundEscalationEmail,
    sendUserAccountStatusChangedEmail,
    sendUserRoleChangedEmail,
} from "../email/adminEmail";
import {
    sendCustomerOrderCancellationEmail,
    sendCustomerOrderStatusEmail,
    sendCustomerRefundStatusEmail,
} from "../email/customerEmail";
import { sendVendorProductStatusEmail } from "../email/vendorEmail";
import { sendVendorOrderCancellationEmail } from "../email/vendorEmail";
import { invalidateCatalogCache, invalidateVendorBusinessCache } from "./cacheService";

export const getApiLogs = async (pageValue: unknown, limitValue: unknown) => {
    const { page, limit, offset } = getPagination(pageValue, limitValue);
    const result = await apiLogs.findAndCountAll({
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });

    return {
        items: result.rows.map(log => ({
            id: log.id,
            userId: log.userId,
            method: log.method,
            statusCode: log.statusCode,
            ipAddress: log.ipAddress,
            time: log.createdAt.toISOString(),
        })),
        pagination: getPaginationMetadata(page, limit, result.count),
    };
};

export const getUsers = async (pageValue: unknown, limitValue: unknown, role?: string) => {
    const { page, limit, offset } = getPagination(pageValue, limitValue);
    const result = await User.findAndCountAll({
        where: role ? { role } : {},
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });

    return {
        items: result.rows.map((user) => user.toSafeJSON ? user.toSafeJSON() : user.toJSON()),
        pagination: getPaginationMetadata(page, limit, result.count),
    };
};

export const getUserById = async (userId: string) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw ApiError.notFound("User not found");
    }

    return user.toSafeJSON ? user.toSafeJSON() : user.toJSON();
};

export const updateUserRole = async (adminId: string, userId: string, role: "user" | "admin" | "vendor") => {
    const admin = await User.findByPk(adminId);
    if (!admin || admin.role !== "admin") {
        throw ApiError.forbidden("Only administrators can update user roles.");
    }

    const user = await User.findByPk(userId);
    if (!user) {
        throw ApiError.notFound("User not found");
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();
    if (previousRole !== role) {
        await sendEmailSafely(() => sendUserRoleChangedEmail({
            to: user.email,
            firstName: user.firstName,
            previousRole,
            newRole: role,
        }));
    }
    return user.toSafeJSON ? user.toSafeJSON() : user.toJSON();
};

export const updateUserStatus = async (adminId: string, userId: string, isActive: boolean) => {
    const admin = await User.findByPk(adminId);
    if (!admin || admin.role !== "admin") {
        throw ApiError.forbidden("Only administrators can update user status.");
    }

    const user = await User.findByPk(userId);
    if (!user) {
        throw ApiError.notFound("User not found");
    }

    const statusChanged = user.isActive !== isActive;
    user.isActive = isActive;
    await user.save();
    if (statusChanged) {
        await sendEmailSafely(() => sendUserAccountStatusChangedEmail({
            to: user.email,
            firstName: user.firstName,
            isActive,
        }));
    }
    return user.toSafeJSON ? user.toSafeJSON() : user.toJSON();
};

export const getBusinesses = async (pageValue: unknown, limitValue: unknown, status?: string) => {
    const { page, limit, offset } = getPagination(pageValue, limitValue);
    const result = await vendorBusiness.findAndCountAll({
        where: status ? { status } : {},
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        include: [{ model: User, as: "user", attributes: ["id", "firstName", "lastName", "email", "role"] }],
    });

    return {
        items: result.rows,
        pagination: getPaginationMetadata(page, limit, result.count),
    };
};

export const getBusinessByIdForAdmin = async (businessId: string) => {
    const business = await vendorBusiness.findByPk(businessId, {
        include: [{ model: User, as: "user", attributes: ["id", "firstName", "lastName", "email", "role"] }],
    });
    if (!business) {
        throw ApiError.notFound("Business not found");
    }
    return business;
};

export const verifyBusiness = async (businessId: string, verified: boolean) => {
    const business = await vendorBusiness.findByPk(businessId);
    if (!business) {
        throw ApiError.notFound("Business not found");
    }

    const status = verified ? "verified" : "rejected";
    const statusChanged = business.status !== status;
    business.isVerified = verified;
    business.status = status;
    await business.save();
    await Promise.all([
        invalidateCatalogCache(),
        invalidateVendorBusinessCache(businessId),
    ]);
    if (statusChanged) {
        await sendEmailSafely(async () => {
            const owner = await User.findByPk(business.userId);
            if (owner) {
                await sendBusinessApplicationDecisionEmail({
                    to: owner.email,
                    firstName: owner.firstName,
                    businessName: business.businessName,
                    status,
                });
            }
        });
    }
    return business;
};

export const updateBusinessStatus = async (businessId: string, status: BusinessStatus) => {
    const business = await vendorBusiness.findByPk(businessId);
    if (!business) {
        throw ApiError.notFound("Business not found");
    }

    const statusChanged = business.status !== status;
    business.status = status;
    business.isVerified = status === "verified";
    await business.save();
    await Promise.all([
        invalidateCatalogCache(),
        invalidateVendorBusinessCache(businessId),
    ]);
    if (statusChanged) {
        await sendEmailSafely(async () => {
            const owner = await User.findByPk(business.userId);
            if (owner) {
                await sendBusinessApplicationDecisionEmail({
                    to: owner.email,
                    firstName: owner.firstName,
                    businessName: business.businessName,
                    status,
                });
            }
        });
    }
    return business;
};

export const getProducts = async (pageValue: unknown, limitValue: unknown, status?: string) => {
    const { page, limit, offset } = getPagination(pageValue, limitValue);
    const result = await product.findAndCountAll({
        where: status ? { status } : {},
        limit,
        offset,
        include: [{ model: vendorBusiness, as: "vendorBusiness", attributes: ["businessId", "businessName", "description", "status", "isVerified"] }],
        order: [["createdAt", "DESC"]],
    });

    return {
        items: result.rows,
        pagination: getPaginationMetadata(page, limit, result.count),
    };
};

export const getProductByIdForAdmin = async (productId: string) => {
    const item = await product.findByPk(productId, {
        include: [{ model: vendorBusiness, as: "vendorBusiness", attributes: ["businessId", "businessName", "description", "status", "isVerified"] }],
    });
    if (!item) {
        throw ApiError.notFound("Product not found");
    }
    return item;
};

export const updateProductStatus = async (productId: string, status: ProductStatus) => {
    const item = await product.findByPk(productId);
    if (!item) {
        throw ApiError.notFound("Product not found");
    }

    const statusChanged = item.status !== status;
    item.status = status;
    await item.save();
    await Promise.all([
        invalidateCatalogCache(),
        invalidateVendorBusinessCache(item.businessId),
    ]);
    if (statusChanged) {
        await sendEmailSafely(async () => {
            const business = await vendorBusiness.findByPk(item.businessId);
            const owner = business ? await User.findByPk(business.userId) : null;
            if (business && owner) {
                await sendVendorProductStatusEmail({
                    to: owner.email,
                    vendorName: owner.firstName,
                    businessName: business.businessName,
                    productName: item.name,
                    status,
                });
            }
        });
    }
    return item;
};

export const getOrders = async (pageValue: unknown, limitValue: unknown, status?: string) => {
    const { page, limit, offset } = getPagination(pageValue, limitValue);
    const result = await Order.findAndCountAll({
        where: status ? { orderStatus: status } : {},
        limit,
        offset,
        include: [
            { model: User, as: "user", attributes: ["id", "firstName", "lastName", "email"] },
            { model: OrderItem, as: "orderItems" },
        ],
        order: [["createdAt", "DESC"]],
    });

    return {
        items: result.rows,
        pagination: getPaginationMetadata(page, limit, result.count),
    };
};

export const getOrderByIdForAdmin = async (orderId: string) => {
    const order = await Order.findByPk(orderId, {
        include: [
            { model: User, as: "user", attributes: ["id", "firstName", "lastName", "email"] },
            { model: OrderItem, as: "orderItems" },
        ],
    });
    if (!order) {
        throw ApiError.notFound("Order not found");
    }
    return order;
};

export const updateAdminOrderStatus = async (orderId: string, status: OrderStatus) => {
    const order = await Order.findByPk(orderId);
    if (!order) {
        throw ApiError.notFound("Order not found");
    }

    const statusChanged = order.orderStatus !== status;
    order.orderStatus = status;
    if (status === "cancelled") {
        order.isCancelled = true;
        order.cancelledAt = new Date();
    }
    await order.save();

    if (statusChanged) {
        await sendEmailSafely(async () => {
            const customer = await User.findByPk(order.customerId);
            if (customer) {
                if (status === "cancelled") {
                    await sendCustomerOrderCancellationEmail({
                        to: customer.email,
                        firstName: customer.firstName,
                        orderId: order.id,
                        reason: order.cancelReason ?? undefined,
                    });
                } else {
                    await sendCustomerOrderStatusEmail({
                        to: customer.email,
                        firstName: customer.firstName,
                        orderId: order.id,
                        status,
                    });
                }
            }
        });

        if (status === "cancelled") {
            await sendEmailSafely(async () => {
                const items = await OrderItem.findAll({ where: { orderId } });
                const itemsByBusiness = new Map<string, string[]>();
                for (const item of items) {
                    const businessItems = itemsByBusiness.get(item.businessId) ?? [];
                    businessItems.push(item.name);
                    itemsByBusiness.set(item.businessId, businessItems);
                }

                await Promise.all(Array.from(itemsByBusiness, async ([businessId, itemNames]) => {
                    await sendEmailSafely(async () => {
                        const business = await vendorBusiness.findByPk(businessId);
                        const owner = business ? await User.findByPk(business.userId) : null;
                        if (business && owner) {
                            await sendVendorOrderCancellationEmail({
                                to: owner.email,
                                vendorName: owner.firstName,
                                businessName: business.businessName,
                                orderId: order.id,
                                items: itemNames,
                                reason: order.cancelReason ?? undefined,
                            });
                        }
                    });
                }));
            });
        }
    }
    return order;
};

export const getRefundRequestsAdmin = async (pageValue: unknown, limitValue: unknown, status?: string) => {
    const { page, limit, offset } = getPagination(pageValue, limitValue);
    const result = await ReturnRequest.findAndCountAll({
        include: [
            { model: User, as: "customer", attributes: ["id", "firstName", "lastName", "email"] },
            { model: vendorBusiness, as: "business", attributes: ["businessId", "businessName", "status", "isVerified"] },
            {
                model: OrderItem,
                as: "orderItem",
                ...(status ? { where: { refundStatus: status }, required: true } : {}),
            },
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        distinct: true,
    });

    return {
        items: result.rows,
        pagination: getPaginationMetadata(page, limit, result.count),
    };
};

export const updateRefundStatusAdmin = async (refundRequestId: string, status: Exclude<RefundStatus, "none" | "requested">) => {
    const refundRequest = await ReturnRequest.findByPk(refundRequestId);
    if (!refundRequest) {
        throw ApiError.notFound("Refund request not found");
    }

    const orderItem = await OrderItem.findByPk(refundRequest.orderItemId);
    if (!orderItem) {
        throw ApiError.notFound("Order item not found");
    }

    const currentStatus: RefundStatus = (orderItem.refundStatus ?? "none") as RefundStatus;
    if (!refundStatusTransitions[currentStatus]?.includes(status)) {
        throw ApiError.conflict(`Cannot change refund status from ${currentStatus} to ${status}`);
    }

    orderItem.refundStatus = status;
    await orderItem.save();

    await sendEmailSafely(async () => {
        const customer = await User.findByPk(refundRequest.customerId);
        if (customer) {
            await sendCustomerRefundStatusEmail({
                to: customer.email,
                firstName: customer.firstName,
                refundRequestId: refundRequest.id,
                itemName: orderItem.name,
                status,
            });
        }
    });

    if (status === "escalated") {
        await sendEmailSafely(async () => {
            const business = await vendorBusiness.findByPk(refundRequest.businessId);
            const admins = await User.findAll({ where: { role: "admin", isActive: true } });
            await Promise.all(admins.map((admin) => sendEmailSafely(() => sendAdminRefundEscalationEmail({
                to: admin.email,
                customerName: "A customer",
                businessName: business?.businessName ?? "Unknown business",
                refundRequestId: refundRequest.id,
                itemName: orderItem.name,
                reasonNote: refundRequest.reasonNote,
            }))));
        });
    }
    return { refundRequest, orderItem };
};

export const getDashboardSummary = async () => {
    const totalUsers = await User.count();
    const totalBusinesses = await vendorBusiness.count();
    const totalProducts = await product.count();
    const totalOrders = await Order.count();
    const pendingRefunds = await OrderItem.count({
        where: { refundStatus: { [Op.in]: ["requested", "processing", "escalated"] } },
    });
    const totalRevenue = await Order.sum("totalAmount");

    return {
        totalUsers,
        totalBusinesses,
        totalProducts,
        totalOrders,
        pendingRefunds,
        totalRevenue: Number(totalRevenue || 0),
    };
};

export const getMetrics = async () => {
    const usersByRole = await User.findAll({
        attributes: ["role", [sequelize.fn("COUNT", sequelize.col("role")), "count"]],
        group: ["role"],
        raw: true,
    });

    const businessesByStatus = await vendorBusiness.findAll({
        attributes: ["status", [sequelize.fn("COUNT", sequelize.col("status")), "count"]],
        group: ["status"],
        raw: true,
    });

    const productsByStatus = await product.findAll({
        attributes: ["status", [sequelize.fn("COUNT", sequelize.col("status")), "count"]],
        group: ["status"],
        raw: true,
    });

    const ordersByStatus = await Order.findAll({
        attributes: ["orderStatus", [sequelize.fn("COUNT", sequelize.col("orderStatus")), "count"]],
        group: ["orderStatus"],
        raw: true,
    });

    const refundsByStatus = await OrderItem.findAll({
        attributes: ["refundStatus", [sequelize.fn("COUNT", sequelize.col("refundStatus")), "count"]],
        group: ["refundStatus"],
        raw: true,
    });

    return {
        usersByRole,
        businessesByStatus,
        productsByStatus,
        ordersByStatus,
        refundsByStatus,
    };
};

export const getSettings = async () => {
    const settings = await appSetting.findAll({ order: [["key", "ASC"]] });
    return settings.map((setting) => ({ key: setting.key, value: setting.value }));
};

export const updateSettings = async (key: string, value: string) => {
    const setting = await appSetting.upsert({ key, value });
    return { key, value, updated: true };
};

export const updatePassword = async (newPassword: string) => {
    const hashedPassword = await hashPassword(newPassword);
    await appSetting.upsert({
        key: "admin_password",
        value: hashedPassword,
    });

    await sendEmailSafely(async () => {
        const admins = await User.findAll({ where: { role: "admin", isActive: true } });
        await Promise.all(admins.map((admin) => sendEmailSafely(() => sendAdminAccessPasswordChangedEmail({
            to: admin.email,
            adminName: admin.firstName,
        }))));
    });

    return { message: "Password set successfully" };
};
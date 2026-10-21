"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRefundStatus = exports.getRefundRequests = exports.updateOrderStatus = exports.getOrderByStatus = exports.deleteProduct = exports.updateProduct = exports.getBusinessProducts = exports.addProduct = exports.updateBusiness = exports.getBusinessProfile = exports.createBusiness = void 0;
const apiError_1 = require("../utils/apiError");
const logger_1 = require("../utils/logger");
const fileUpolad_1 = require("../helper/fileUpolad");
const models_1 = require("../models");
const lifecycle_1 = require("../types/lifecycle");
const pagination_1 = require("../utils/pagination");
const businessEmail_1 = require("../email/businessEmail");
const mailDelivery_1 = require("../email/mailDelivery");
const customerEmail_1 = require("../email/customerEmail");
const adminEmail_1 = require("../email/adminEmail");
const cacheService_1 = require("./cacheService");
const createBusiness = async (data, email) => {
    try {
        const { businessName, description } = data;
        const user = await models_1.User.findOne({ where: { email: email } });
        const exisitingBusiness = await models_1.vendorBusiness.findOne({ where: { userId: user.id } });
        if (exisitingBusiness) {
            throw new apiError_1.ApiError(409, "Business already exist");
        }
        logger_1.logger.info(`Registering business for user: ${user.id}, email: ${user.email}, businessName: ${businessName}`);
        const business = await models_1.vendorBusiness.create({
            userId: user.id,
            businessName,
            description
        });
        await user.update({ role: "vendor" });
        await (0, cacheService_1.invalidateCatalogCache)();
        await (0, mailDelivery_1.sendEmailSafely)(() => (0, businessEmail_1.sendBusinessApplicationReceivedEmail)({
            to: user.email,
            firstName: user.firstName,
            businessName: business.businessName,
        }));
        await (0, mailDelivery_1.sendEmailSafely)(async () => {
            const admins = await models_1.User.findAll({ where: { role: "admin", isActive: true } });
            await Promise.all(admins.map((admin) => (0, mailDelivery_1.sendEmailSafely)(() => (0, businessEmail_1.sendAdminBusinessApplicationEmail)({
                to: admin.email,
                applicantName: `${user.firstName} ${user.lastName}`,
                applicantEmail: user.email,
                businessName: business.businessName,
                description: business.description,
            }))));
        });
        return business.toJSON();
    }
    catch (error) {
        logger_1.logger.error("Error registering business:", error);
        throw new apiError_1.ApiError(500, "Failed to register business.");
    }
};
exports.createBusiness = createBusiness;
const getBusinessProfile = async (id) => {
    const cacheKey = `vendor:${id}:profile`;
    const cachedProfile = await (0, cacheService_1.getCache)(cacheKey);
    if (cachedProfile !== null) {
        return cachedProfile;
    }
    const business = await models_1.vendorBusiness.findByPk(id, {
        include: [
            { model: models_1.product, as: "product" },
            { model: models_1.User, as: "user", attributes: ["id", "firstName", "lastName", "email", "role"] },
        ],
    });
    if (!business) {
        throw apiError_1.ApiError.notFound("Business not found.");
    }
    await (0, cacheService_1.setCache)(cacheKey, business, 600);
    return business;
};
exports.getBusinessProfile = getBusinessProfile;
const updateBusiness = async (id, businessId, data) => {
    try {
        const business = await models_1.vendorBusiness.findByPk(businessId);
        if (!business) {
            throw new apiError_1.ApiError(404, "business not found");
        }
        if (id !== business.userId) {
            throw new apiError_1.ApiError(403, "You are not authorized to update this business.");
        }
        await business?.update(data);
        await Promise.all([
            (0, cacheService_1.invalidateCatalogCache)(),
            (0, cacheService_1.invalidateVendorBusinessCache)(businessId),
        ]);
        return business;
    }
    catch (error) {
        logger_1.logger.error("Error updating vendor:", error);
        throw new apiError_1.ApiError(500, "Failed to update vendor.");
    }
};
exports.updateBusiness = updateBusiness;
const addProduct = async (id, data) => {
    try {
        const { name, description, price, quantity, categoryIds = [], file } = data;
        const business = await models_1.vendorBusiness.findByPk(id);
        if (!business) {
            throw new apiError_1.ApiError(401, "business not found.");
        }
        const uniqueCategoryIds = [...new Set(categoryIds)];
        const categories = uniqueCategoryIds.length
            ? await models_1.Category.findAll({ where: { id: uniqueCategoryIds } })
            : [];
        if (categories.length !== uniqueCategoryIds.length) {
            throw new apiError_1.ApiError(400, "One or more product categories do not exist.");
        }
        const uploaded = await (0, fileUpolad_1.uploadImageToCloudinary)(file, business.businessId, "products");
        const Product = await models_1.product.create({
            name,
            description,
            price,
            quantity,
            businessId: business.businessId,
            categoryNames: categories.map((category) => category.category),
            imagePublicId: uploaded.publicId,
            imageUrl: uploaded.secureUrl
        });
        if (categories.length) {
            await Product.setCategories(categories);
        }
        await Promise.all([
            (0, cacheService_1.invalidateCatalogCache)(),
            (0, cacheService_1.invalidateVendorBusinessCache)(business.businessId),
        ]);
        return Product;
    }
    catch (error) {
        logger_1.logger.error("Error adding product:", error);
        if (error instanceof apiError_1.ApiError) {
            throw error;
        }
        throw new apiError_1.ApiError(500, `Failed to add product: ${error instanceof Error ? error.message : "unknown error"}`);
    }
};
exports.addProduct = addProduct;
const getBusinessProducts = async (businessId, pageValue, limitValue) => {
    try {
        const { page, limit, offset } = (0, pagination_1.getPagination)(pageValue, limitValue);
        const cacheKey = `vendor:${businessId}:products:${page}:${limit}`;
        const cachedProducts = await (0, cacheService_1.getCache)(cacheKey);
        if (cachedProducts !== null) {
            return cachedProducts;
        }
        const result = await models_1.product.findAndCountAll({
            where: { businessId },
            include: [{ model: models_1.vendorBusiness, as: "vendorBusiness", attributes: ["businessId", "businessName", "description"] }],
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });
        const products = {
            items: result.rows,
            pagination: (0, pagination_1.getPaginationMetadata)(page, limit, result.count),
        };
        await (0, cacheService_1.setCache)(cacheKey, products);
        return products;
    }
    catch (error) {
        logger_1.logger.error("Error fetching business products:", error);
        throw new apiError_1.ApiError(500, "Failed to fetch business products.");
    }
};
exports.getBusinessProducts = getBusinessProducts;
const updateProduct = async (businessId, productId, data) => {
    try {
        const prod = await models_1.product.findOne({ where: {
                id: productId,
                businessId: businessId
            } });
        if (!prod) {
            throw apiError_1.ApiError.notFound("product not found");
        }
        const { categoryIds, ...productFields } = data;
        let categories;
        if (categoryIds !== undefined) {
            const uniqueCategoryIds = [...new Set(categoryIds)];
            categories = uniqueCategoryIds.length
                ? await models_1.Category.findAll({ where: { id: uniqueCategoryIds } })
                : [];
            if (categories.length !== uniqueCategoryIds.length) {
                throw new apiError_1.ApiError(400, "One or more product categories do not exist.");
            }
        }
        const categoryNames = categories?.map((category) => category.category);
        if (Object.keys(productFields).length) {
            await prod.update(productFields);
        }
        if (categories !== undefined) {
            await prod.setCategories(categories);
            await prod.update({ categoryNames });
        }
        await Promise.all([
            (0, cacheService_1.invalidateCatalogCache)(),
            (0, cacheService_1.invalidateVendorBusinessCache)(businessId),
        ]);
        return prod;
    }
    catch (error) {
        logger_1.logger.error("Error updating Product: ", error);
        if (error instanceof apiError_1.ApiError) {
            throw error;
        }
        throw apiError_1.ApiError.internalServerError("updating failed");
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (productId, businessId) => {
    try {
        const prod = await models_1.product.findOne({ where: {
                id: productId,
                businessId: businessId
            } });
        if (!prod) {
            throw apiError_1.ApiError.notFound("product not found");
        }
        await prod.destroy();
        await Promise.all([
            (0, cacheService_1.invalidateCatalogCache)(),
            (0, cacheService_1.invalidateVendorBusinessCache)(businessId),
        ]);
        return prod;
    }
    catch (error) {
        logger_1.logger.error("cannot delete product");
        throw apiError_1.ApiError.internalServerError("deleting failed", error);
    }
};
exports.deleteProduct = deleteProduct;
const getOrderByStatus = async (businessId, status, pageValue, limitValue) => {
    const { page, limit, offset } = (0, pagination_1.getPagination)(pageValue, limitValue);
    const result = await models_1.OrderItem.findAndCountAll({
        where: status ? { businessId, itemStatus: status } : { businessId },
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });
    return {
        items: result.rows,
        pagination: (0, pagination_1.getPaginationMetadata)(page, limit, result.count),
    };
};
exports.getOrderByStatus = getOrderByStatus;
const updateOrderStatus = async (itemId, businessId, status) => {
    const order = await models_1.OrderItem.findOne({
        where: {
            id: itemId,
            businessId: businessId,
        }
    });
    if (!order) {
        throw new apiError_1.ApiError(404, "order not found");
    }
    const statusChanged = order.itemStatus !== status;
    await order.update({ itemStatus: status });
    if (statusChanged) {
        await (0, mailDelivery_1.sendEmailSafely)(async () => {
            const parentOrder = await models_1.Order.findByPk(order.orderId);
            const customer = parentOrder ? await models_1.User.findByPk(parentOrder.customerId) : null;
            if (parentOrder && customer) {
                await (0, customerEmail_1.sendCustomerOrderStatusEmail)({
                    to: customer.email,
                    firstName: customer.firstName,
                    orderId: parentOrder.id,
                    itemName: order.name,
                    status,
                });
            }
        });
    }
    return order;
};
exports.updateOrderStatus = updateOrderStatus;
const getRefundRequests = async (userId, businessId, status, pageValue, limitValue) => {
    const business = await models_1.vendorBusiness.findOne({ where: { businessId, userId } });
    if (!business) {
        throw apiError_1.ApiError.notFound("Business not found");
    }
    const { page, limit, offset } = (0, pagination_1.getPagination)(pageValue, limitValue);
    const result = await models_1.ReturnRequest.findAndCountAll({
        where: { businessId },
        include: [
            {
                model: models_1.OrderItem,
                as: "orderItem",
                ...(status ? { where: { refundStatus: status }, required: true } : {}),
            },
            { model: models_1.User, as: "customer", attributes: ["id", "firstName", "lastName", "email"] },
        ],
        distinct: true,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });
    return {
        items: result.rows,
        pagination: (0, pagination_1.getPaginationMetadata)(page, limit, result.count),
    };
};
exports.getRefundRequests = getRefundRequests;
const updateRefundStatus = async (userId, businessId, refundRequestId, status) => {
    const transaction = await models_1.sequelize.transaction();
    try {
        const business = await models_1.vendorBusiness.findOne({ where: { businessId, userId }, transaction });
        if (!business) {
            throw apiError_1.ApiError.notFound("Business not found");
        }
        const refundRequest = await models_1.ReturnRequest.findOne({
            where: { id: refundRequestId, businessId },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });
        if (!refundRequest) {
            throw apiError_1.ApiError.notFound("Refund request not found");
        }
        const orderItem = await models_1.OrderItem.findByPk(refundRequest.orderItemId, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });
        if (!orderItem) {
            throw apiError_1.ApiError.notFound("Order item not found");
        }
        const currentStatus = (orderItem.refundStatus ?? "none");
        if (!lifecycle_1.refundStatusTransitions[currentStatus]?.includes(status)) {
            throw apiError_1.ApiError.conflict(`Cannot change refund status from ${currentStatus} to ${status}`);
        }
        await orderItem.update({ refundStatus: status }, { transaction });
        await transaction.commit();
        await (0, mailDelivery_1.sendEmailSafely)(async () => {
            const customer = await models_1.User.findByPk(refundRequest.customerId);
            if (customer) {
                await (0, customerEmail_1.sendCustomerRefundStatusEmail)({
                    to: customer.email,
                    firstName: customer.firstName,
                    refundRequestId: refundRequest.id,
                    itemName: orderItem.name,
                    status,
                });
            }
        });
        if (status === "escalated") {
            await (0, mailDelivery_1.sendEmailSafely)(async () => {
                const admins = await models_1.User.findAll({ where: { role: "admin", isActive: true } });
                await Promise.all(admins.map((admin) => (0, mailDelivery_1.sendEmailSafely)(() => (0, adminEmail_1.sendAdminRefundEscalationEmail)({
                    to: admin.email,
                    customerName: "A customer",
                    businessName: business.businessName,
                    refundRequestId: refundRequest.id,
                    itemName: orderItem.name,
                    reasonNote: refundRequest.reasonNote,
                }))));
            });
        }
        return { refundRequest, orderItem };
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};
exports.updateRefundStatus = updateRefundStatus;

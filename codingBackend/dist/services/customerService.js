"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.addOrderItem = exports.cancelOrder = exports.requestRefund = exports.getProductsByCategory = exports.getBusinessProductById = exports.searchProducts = exports.getBusinessProducts = exports.getBusinessById = exports.getBusinesses = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const apiError_1 = require("../utils/apiError");
const pagination_1 = require("../utils/pagination");
const mailDelivery_1 = require("../email/mailDelivery");
const customerEmail_1 = require("../email/customerEmail");
const vendorEmail_1 = require("../email/vendorEmail");
const cacheService_1 = require("./cacheService");
const getBusinesses = async (pageValue, limitValue) => {
    const { page, limit, offset } = (0, pagination_1.getPagination)(pageValue, limitValue);
    const cacheKey = `catalog:businesses:${page}:${limit}`;
    const cachedBusinesses = await (0, cacheService_1.getCache)(cacheKey);
    if (cachedBusinesses !== null) {
        return cachedBusinesses;
    }
    const result = await models_1.vendorBusiness.findAndCountAll({
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });
    const businesses = {
        items: result.rows,
        pagination: (0, pagination_1.getPaginationMetadata)(page, limit, result.count),
    };
    await (0, cacheService_1.setCache)(cacheKey, businesses);
    return businesses;
};
exports.getBusinesses = getBusinesses;
const getBusinessById = async (id) => {
    const cacheKey = `catalog:business:${id}`;
    const cachedBusiness = await (0, cacheService_1.getCache)(cacheKey);
    if (cachedBusiness !== null) {
        return cachedBusiness;
    }
    const business = await models_1.vendorBusiness.findByPk(id, {
        include: [{
                model: models_1.product,
                as: "product",
            }],
    });
    if (!business) {
        throw new apiError_1.ApiError(404, "Business not found");
    }
    await (0, cacheService_1.setCache)(cacheKey, business);
    return business;
};
exports.getBusinessById = getBusinessById;
const getBusinessProducts = async (id, pageValue, limitValue) => {
    const { page, limit, offset } = (0, pagination_1.getPagination)(pageValue, limitValue);
    const cacheKey = `catalog:business:${id}:products:${page}:${limit}`;
    const cachedProducts = await (0, cacheService_1.getCache)(cacheKey);
    if (cachedProducts !== null) {
        return cachedProducts;
    }
    const result = await models_1.product.findAndCountAll({
        where: { businessId: id },
        attributes: ["id", "businessId", "name", "description", "price", "quantity", "imageUrl", "categoryNames"],
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
};
exports.getBusinessProducts = getBusinessProducts;
const searchProducts = async (search, pageValue, limitValue) => {
    const { page, limit, offset } = (0, pagination_1.getPagination)(pageValue, limitValue);
    const cacheKey = `catalog:search:${encodeURIComponent(search.toLowerCase())}:${page}:${limit}`;
    const cachedProducts = await (0, cacheService_1.getCache)(cacheKey);
    if (cachedProducts !== null) {
        return cachedProducts;
    }
    const result = await models_1.product.findAndCountAll({
        where: {
            [sequelize_1.Op.or]: [
                { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { description: { [sequelize_1.Op.iLike]: `%${search}%` } },
            ],
        },
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
};
exports.searchProducts = searchProducts;
const getBusinessProductById = async (businessId, productId) => {
    const cacheKey = `catalog:product:${businessId}:${productId}`;
    const cachedProduct = await (0, cacheService_1.getCache)(cacheKey);
    if (cachedProduct !== null) {
        return cachedProduct;
    }
    const reqProduct = await models_1.product.findOne({
        where: {
            businessId: businessId,
            id: productId
        },
        include: [{ model: models_1.vendorBusiness, as: "vendorBusiness", attributes: ["businessId", "businessName", "description"] }],
    });
    if (!reqProduct) {
        throw apiError_1.ApiError.notFound("product not found");
    }
    await (0, cacheService_1.setCache)(cacheKey, reqProduct);
    return reqProduct;
};
exports.getBusinessProductById = getBusinessProductById;
const getProductsByCategory = async (categoryId, pageValue, limitValue) => {
    const category = await models_1.Category.findByPk(categoryId);
    if (!category) {
        throw apiError_1.ApiError.notFound("Product category not found");
    }
    const { page, limit, offset } = (0, pagination_1.getPagination)(pageValue, limitValue);
    const cacheKey = `catalog:category:${categoryId}:products:${page}:${limit}`;
    const cachedProducts = await (0, cacheService_1.getCache)(cacheKey);
    if (cachedProducts !== null) {
        return cachedProducts;
    }
    const result = await models_1.product.findAndCountAll({
        where: { categoryNames: { [sequelize_1.Op.contains]: [category.category] } },
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
};
exports.getProductsByCategory = getProductsByCategory;
const requestRefund = async (customerId, orderItemId, reasonNote) => {
    const transaction = await models_1.sequelize.transaction();
    try {
        const orderItem = await models_1.OrderItem.findByPk(orderItemId, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });
        if (!orderItem) {
            throw apiError_1.ApiError.notFound("Order item not found");
        }
        const order = await models_1.Order.findOne({
            where: { id: orderItem.orderId, customerId },
            transaction,
        });
        if (!order) {
            throw apiError_1.ApiError.notFound("Order item not found");
        }
        if (orderItem.refundStatus !== "none") {
            throw apiError_1.ApiError.conflict("A refund request already exists or this item is not eligible");
        }
        const refundRequest = await models_1.ReturnRequest.create({
            orderItemId: orderItem.id,
            customerId,
            businessId: orderItem.businessId,
            reasonNote,
        }, { transaction });
        await orderItem.update({ refundStatus: "requested" }, { transaction });
        await transaction.commit();
        await (0, mailDelivery_1.sendEmailSafely)(async () => {
            const customer = await models_1.User.findByPk(customerId);
            if (customer) {
                await (0, customerEmail_1.sendCustomerRefundRequestReceivedEmail)({
                    to: customer.email,
                    firstName: customer.firstName,
                    refundRequestId: refundRequest.id,
                    itemName: orderItem.name,
                    reasonNote,
                });
            }
        });
        await (0, mailDelivery_1.sendEmailSafely)(async () => {
            const business = await models_1.vendorBusiness.findByPk(orderItem.businessId);
            const owner = business ? await models_1.User.findByPk(business.userId) : null;
            if (business && owner) {
                await (0, vendorEmail_1.sendVendorRefundRequestEmail)({
                    to: owner.email,
                    vendorName: owner.firstName,
                    businessName: business.businessName,
                    customerName: "A customer",
                    refundRequestId: refundRequest.id,
                    itemName: orderItem.name,
                    reasonNote,
                });
            }
        });
        return { refundRequest, orderItem };
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};
exports.requestRefund = requestRefund;
const cancelOrder = async (orderId, customerId, reason) => {
    const order = await models_1.Order.findOne({
        where: { id: orderId, customerId },
    });
    if (!order) {
        throw apiError_1.ApiError.notFound("Order not found");
    }
    if (order.isCancelled) {
        throw apiError_1.ApiError.conflict("This order has already been cancelled");
    }
    if (["shipped", "delivered"].includes(order.orderStatus)) {
        throw apiError_1.ApiError.conflict("This order cannot be cancelled after it has been shipped or delivered");
    }
    order.isCancelled = true;
    order.cancelledAt = new Date();
    order.cancelReason = reason ?? "Customer cancelled this order";
    order.orderStatus = "cancelled";
    await order.save();
    await (0, mailDelivery_1.sendEmailSafely)(async () => {
        const customer = await models_1.User.findByPk(customerId);
        if (customer) {
            await (0, customerEmail_1.sendCustomerOrderCancellationEmail)({
                to: customer.email,
                firstName: customer.firstName,
                orderId: order.id,
                reason: order.cancelReason ?? undefined,
            });
        }
    });
    await (0, mailDelivery_1.sendEmailSafely)(async () => {
        const items = await models_1.OrderItem.findAll({ where: { orderId } });
        const itemsByBusiness = new Map();
        for (const item of items) {
            const businessItems = itemsByBusiness.get(item.businessId) ?? [];
            businessItems.push(item.name);
            itemsByBusiness.set(item.businessId, businessItems);
        }
        await Promise.all(Array.from(itemsByBusiness, async ([businessId, itemNames]) => {
            await (0, mailDelivery_1.sendEmailSafely)(async () => {
                const business = await models_1.vendorBusiness.findByPk(businessId);
                const owner = business ? await models_1.User.findByPk(business.userId) : null;
                if (business && owner) {
                    await (0, vendorEmail_1.sendVendorOrderCancellationEmail)({
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
    return order;
};
exports.cancelOrder = cancelOrder;
const addOrderItem = async (orderId, productId, qty) => {
    const transaction = await models_1.sequelize.transaction();
    let transactionCommitted = false;
    try {
        const order = await models_1.Order.findByPk(orderId, { transaction });
        const prod = await models_1.product.findByPk(productId, { transaction });
        if (!order)
            throw new apiError_1.ApiError(404, "Order not found");
        if (!prod) {
            throw new apiError_1.ApiError(404, "Product not found");
        }
        if (prod.quantity <= 0 || prod.quantity < qty) {
            throw new apiError_1.ApiError(400, "Product out of stock");
        }
        const payload = {
            orderId: orderId,
            productId: prod.id,
            businessId: prod.businessId,
            name: prod.name,
            quantity: qty,
            unitPrice: prod.price
        };
        const item = await models_1.OrderItem.create(payload, { transaction });
        await prod.decrement('quantity', { by: qty, transaction });
        const additionalCost = prod.price * qty;
        order.totalAmount = Number(order.totalAmount) + additionalCost;
        await order.save({ transaction });
        await transaction.commit();
        transactionCommitted = true;
        await Promise.all([
            (0, cacheService_1.invalidateCatalogCache)(),
            (0, cacheService_1.invalidateVendorBusinessCache)(prod.businessId),
        ]);
        return item;
    }
    catch (error) {
        if (!transactionCommitted) {
            await transaction.rollback();
        }
        throw error;
    }
};
exports.addOrderItem = addOrderItem;
const createOrder = async (customerId, items) => {
    const transaction = await models_1.sequelize.transaction();
    let transactionCommitted = false;
    try {
        const user = await models_1.User.findByPk(customerId);
        const order = await models_1.Order.create({
            customerId: customerId,
            totalAmount: 0,
            shippingAddress: user.address
        }, { transaction });
        let runningTotal = 0;
        const itemsByBusiness = new Map();
        for (const item of items) {
            const prod = await models_1.product.findByPk(item.productId, { transaction });
            if (!prod)
                throw new apiError_1.ApiError(404, "product not found");
            if (prod.quantity <= 0 || prod.quantity < item.qty)
                throw new apiError_1.ApiError(400, "product out of stock");
            runningTotal += (prod.price * item.qty);
            const payload = {
                orderId: order.id,
                productId: prod.id,
                businessId: prod.businessId,
                name: prod.name,
                quantity: item.qty,
                unitPrice: prod.price
            };
            await models_1.OrderItem.create(payload, { transaction });
            const businessItems = itemsByBusiness.get(prod.businessId) ?? [];
            businessItems.push({ name: prod.name, quantity: item.qty, unitPrice: prod.price });
            itemsByBusiness.set(prod.businessId, businessItems);
            await prod.decrement('quantity', { by: item.qty, transaction });
        }
        order.totalAmount = runningTotal;
        await order.save({ transaction });
        await transaction.commit();
        transactionCommitted = true;
        await Promise.all([
            (0, cacheService_1.invalidateCatalogCache)(),
            ...Array.from(itemsByBusiness.keys(), (businessId) => (0, cacheService_1.invalidateVendorBusinessCache)(businessId)),
        ]);
        await (0, mailDelivery_1.sendEmailSafely)(() => (0, customerEmail_1.sendCustomerOrderConfirmationEmail)({
            to: user.email,
            firstName: user.firstName,
            orderId: order.id,
            items: Array.from(itemsByBusiness.values()).flat(),
            totalAmount: runningTotal,
            shippingAddress: user.address,
        }));
        await Promise.all(Array.from(itemsByBusiness, async ([businessId, businessItems]) => {
            await (0, mailDelivery_1.sendEmailSafely)(async () => {
                const business = await models_1.vendorBusiness.findByPk(businessId);
                const owner = business ? await models_1.User.findByPk(business.userId) : null;
                if (business && owner) {
                    const businessTotal = businessItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
                    await (0, vendorEmail_1.sendVendorNewOrderEmail)({
                        to: owner.email,
                        vendorName: owner.firstName,
                        businessName: business.businessName,
                        orderId: order.id,
                        items: businessItems,
                        totalAmount: businessTotal,
                        shippingAddress: user.address,
                    });
                }
            });
        }));
        return order;
    }
    catch (error) {
        if (!transactionCommitted) {
            await transaction.rollback();
        }
        throw error;
    }
};
exports.createOrder = createOrder;

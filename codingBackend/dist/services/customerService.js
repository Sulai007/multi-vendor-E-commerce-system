"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.addOrderItem = exports.getBusinessProductById = exports.getBusinessProducts = exports.getBusinessById = exports.getBusinesses = void 0;
const models_1 = require("../models");
const apiError_1 = require("../utils/apiError");
const getBusinesses = async () => {
    return await models_1.vendorBusiness.findAll();
};
exports.getBusinesses = getBusinesses;
const getBusinessById = async (id) => {
    const business = await models_1.vendorBusiness.findByPk(id);
    if (!business) {
        throw new apiError_1.ApiError(404, "Business not found");
    }
    return business;
};
exports.getBusinessById = getBusinessById;
const getBusinessProducts = async (id) => {
    const products = await models_1.product.findAll({ where: {
            businessId: id
        },
        attributes: ['name', 'description', 'price', 'quantity', 'imageUrl']
    });
    return products;
};
exports.getBusinessProducts = getBusinessProducts;
const getBusinessProductById = async (businessId, productId) => {
    const reqProduct = await models_1.product.findOne({
        where: {
            businessId: businessId,
            id: productId
        }
    });
    if (!reqProduct) {
        throw apiError_1.ApiError.notFound("product not found");
    }
    return reqProduct;
};
exports.getBusinessProductById = getBusinessProductById;
const addOrderItem = async (orderId, productId, qty) => {
    const transaction = await models_1.sequelize.transaction();
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
        return item;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};
exports.addOrderItem = addOrderItem;
const createOrder = async (customerId, items) => {
    const transaction = await models_1.sequelize.transaction();
    try {
        const user = await models_1.User.findByPk(customerId);
        const order = await models_1.Order.create({
            customerId: customerId,
            totalAmount: 0,
            shippingAddress: user.address
        }, { transaction });
        let runningTotal = 0;
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
            await prod.decrement('quantity', { by: item.qty, transaction });
        }
        order.totalAmount = runningTotal;
        await order.save({ transaction });
        await transaction.commit();
        return order;
    }
    catch (error) {
        await transaction.rollback;
        throw error;
    }
};
exports.createOrder = createOrder;

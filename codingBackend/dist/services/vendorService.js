"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrderByStatus = exports.deleteProduct = exports.updateProduct = exports.getBusinessProducts = exports.addProduct = exports.updateBusiness = exports.getBusinessProfile = exports.createBusiness = void 0;
const apiError_1 = require("../utils/apiError");
const logger_1 = require("../utils/logger");
const fileUpolad_1 = require("../helper/fileUpolad");
const models_1 = require("../models");
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
        return business.toJSON();
    }
    catch (error) {
        logger_1.logger.error("Error registering business:", error);
        throw new apiError_1.ApiError(500, "Failed to register business.");
    }
};
exports.createBusiness = createBusiness;
const getBusinessProfile = async (id) => {
    return await models_1.vendorBusiness.findByPk(id);
    // try {
    //     if (!business) {
    //         throw new ApiError(404, "Business not found.");
    //     }
    //      business.toJSON() as vendorBusiness;
    // } 
    // catch (error) {
    //     logger.error("Error fetching business:", error);
    //     throw new ApiError(500, "Failed to fetch business.");
    // }
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
        const { name, description, price, quantity, file } = data;
        const business = await models_1.vendorBusiness.findByPk(id);
        if (!business) {
            throw new apiError_1.ApiError(401, "business not found.");
        }
        const uploaded = await (0, fileUpolad_1.uploadImageToCloudinary)(file, business.businessId, "products");
        const Product = await models_1.product.create({
            name,
            description,
            price,
            quantity,
            businessId: business.businessId,
            imagePublicId: uploaded.publicId,
            imageUrl: uploaded.secureUrl
        });
        return Product;
    }
    catch (error) {
        logger_1.logger.error("Error adding product:", error);
        throw new apiError_1.ApiError(500, `Failed to add product: ${error instanceof Error ? error.message : "unknown error"}`);
    }
};
exports.addProduct = addProduct;
const getBusinessProducts = async (businessId) => {
    try {
        const products = await models_1.product.findAll({ where: { businessId: businessId } });
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
        await prod.update(data);
        return prod;
    }
    catch (error) {
        logger_1.logger.error("Error updating Product: ", error);
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
        return prod;
    }
    catch (error) {
        logger_1.logger.error("cannot delete product");
        throw apiError_1.ApiError.internalServerError("deleting failed", error);
    }
};
exports.deleteProduct = deleteProduct;
const getOrderByStatus = async (businessId, status) => {
    const orders = await models_1.OrderItem.findAll({ where: {
            businessId: businessId,
            itemStatus: status
        } });
    return orders;
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
    await order?.update("itemStatus", status);
    return "update successful";
};
exports.updateOrderStatus = updateOrderStatus;

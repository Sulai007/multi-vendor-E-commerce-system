"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrderByStatus = exports.deleteProduct = exports.updateProduct = exports.addProduct = exports.getBusinessProducts = exports.updateBusiness = exports.getBusinessProfile = exports.createBusiness = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const vendorService = __importStar(require("../services/vendorService"));
exports.createBusiness = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const business = await vendorService.createBusiness(req.body, req.user?.email);
    (0, apiResponse_1.sendSuccess)(res, {
        message: "Business registered successfully.",
        data: business,
    });
});
exports.getBusinessProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const business = await vendorService.getBusinessProfile(req.params.id);
    (0, apiResponse_1.sendSuccess)(res, {
        statusCode: 200,
        message: "business profile fetched successfully.",
        data: business,
    });
});
exports.updateBusiness = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const { businessName, description } = req.body;
    if (!businessName && !description) {
        throw new apiError_1.ApiError(400, "At least one field (businessName or description) must be provided for update");
    }
    const updatedBusiness = await vendorService.updateBusiness(id, req.params.id, req.body);
    (0, apiResponse_1.sendSuccess)(res, {
        statusCode: 200,
        message: "Business updated successfully.",
        data: updatedBusiness,
    });
});
exports.getBusinessProducts = (0, catchAsync_1.catchAsync)(async (req, res) => {
    // if (req.user?.role === "vendor" && req.user?.sub !== req.params.id) {
    //     throw new ApiError(403, "You are not authorized to fetch these products.");
    // }
    const products = await vendorService.getBusinessProducts(req.params.businessId);
    (0, apiResponse_1.sendSuccess)(res, {
        statusCode: 200,
        message: "Vendor products fetched successfully.",
        data: products,
    });
});
exports.addProduct = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { name, description, price, quantity } = req.body;
    const file = req.file;
    if (!name || !description || !price || !quantity) {
        throw new apiError_1.ApiError(400, "Missing required fields: name, description, price, quantity");
    }
    if (!file) {
        throw new apiError_1.ApiError(400, "please include a product image");
    }
    const data = {
        name,
        description,
        price,
        quantity,
        file
    };
    const product = await vendorService.addProduct(req.params.businessId, data);
    (0, apiResponse_1.sendSuccess)(res, {
        statusCode: 201,
        message: "Product added successfully.",
        data: product,
    });
});
exports.updateProduct = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const updatedProduct = await vendorService.updateProduct(req.params.businessId, req.params.id, req.body);
    (0, apiResponse_1.sendSuccess)(res, {
        statusCode: 200,
        message: "product updated successfully",
        data: updatedProduct
    });
});
exports.deleteProduct = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const deletedProduct = await vendorService.deleteProduct(req.params.id, req.params.businessId);
    (0, apiResponse_1.sendSuccess)(res, {
        statusCode: 200,
        message: "product deleted successfully",
        data: deletedProduct
    });
});
exports.getOrderByStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const status = req.query.status;
    const id = req.params.businessId;
    const products = await vendorService.getOrderByStatus(id, status);
    (0, apiResponse_1.sendSuccess)(res, {
        statusCode: 200,
        message: "products fetched successfully",
        data: products
    });
});
exports.updateOrderStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.businessId;
});

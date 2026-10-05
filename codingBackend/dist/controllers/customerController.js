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
exports.addToOrder = exports.createOrder = exports.getBusinessProductById = exports.getBusinessProducts = exports.getBusinessById = exports.getBusinesses = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const catchAsync_1 = require("../utils/catchAsync");
const customerService = __importStar(require("../services/customerService"));
exports.getBusinesses = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const businesses = await customerService.getBusinesses();
    (0, apiResponse_1.sendSuccess)(res, {
        statusCode: 202,
        message: "Businesses retrieved successfulyy",
        data: businesses
    });
});
exports.getBusinessById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.businessId;
    const business = await customerService.getBusinessById(id);
    (0, apiResponse_1.sendSuccess)(res, {
        statusCode: 202,
        message: "Business fetched successfully",
        data: business
    });
});
exports.getBusinessProducts = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.businessId;
    const businessProducts = await customerService.getBusinessProducts(id);
    (0, apiResponse_1.sendSuccess)(res, {
        statusCode: 202,
        message: "Business Products fetched successfully",
        data: businessProducts
    });
});
exports.getBusinessProductById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const businessId = req.params.businessId;
    const productId = req.params.productId;
    const product = await customerService.getBusinessProductById(businessId, productId);
    (0, apiResponse_1.sendSuccess)(res, {
        statusCode: 202,
        message: "Product fecthed successfully",
        data: product
    });
});
exports.createOrder = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.user?.sub;
    const items = req.body;
    const order = await customerService.createOrder(id, items);
    (0, apiResponse_1.sendSuccess)(res, {
        statusCode: 200,
        message: "Order successfully created",
        data: order
    });
});
exports.addToOrder = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const orderId = req.params.orderid;
    const prodId = req.params.prodId;
    const qty = req.body;
    const item = await customerService.addOrderItem(orderId, prodId, qty);
    (0, apiResponse_1.sendSuccess)(res, {
        statusCode: 200,
        message: "item successfully added to Order",
        data: item
    });
});

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
exports.updateSettings = exports.getSettings = exports.getMetrics = exports.getDashboardSummary = exports.updateRefundStatusAdmin = exports.getRefundRequestsAdmin = exports.updateAdminOrderStatus = exports.getOrderByIdAdmin = exports.getOrdersAdmin = exports.updateProductStatus = exports.getProductByIdForAdmin = exports.getProductsForAdmin = exports.updateBusinessStatus = exports.verifyBusiness = exports.getBusinessByIdForAdmin = exports.getBusinessesForAdmin = exports.updateUserStatus = exports.updateUserRole = exports.getUserById = exports.getUsers = exports.updatePassword = exports.getApiLogs = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const apiResponse_1 = require("../utils/apiResponse");
const logService = __importStar(require("../services/adminService"));
exports.getApiLogs = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await logService.getApiLogs(req.query.page, req.query.limit);
    (0, apiResponse_1.sendSuccess)(res, {
        message: "API logs retrieved successfully",
        data: { logs: result.items },
        pagination: result.pagination,
    });
});
exports.updatePassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await logService.updatePassword(req.body.password);
    (0, apiResponse_1.sendSuccess)(res, { message: "Password set successfully" });
});
exports.getUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await logService.getUsers(req.query.page, req.query.limit, req.query.role);
    (0, apiResponse_1.sendSuccess)(res, { message: "Users retrieved successfully", data: result.items, pagination: result.pagination });
});
exports.getUserById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await logService.getUserById(req.params.userId);
    (0, apiResponse_1.sendSuccess)(res, { message: "User retrieved successfully", data: user });
});
exports.updateUserRole = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const adminId = req.user?.sub;
    const user = await logService.updateUserRole(adminId, req.params.userId, req.body.role);
    (0, apiResponse_1.sendSuccess)(res, { message: "User role updated successfully", data: user });
});
exports.updateUserStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const adminId = req.user?.sub;
    const user = await logService.updateUserStatus(adminId, req.params.userId, req.body.isActive);
    (0, apiResponse_1.sendSuccess)(res, { message: "User status updated successfully", data: user });
});
exports.getBusinessesForAdmin = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await logService.getBusinesses(req.query.page, req.query.limit, req.query.status);
    (0, apiResponse_1.sendSuccess)(res, { message: "Businesses retrieved successfully", data: result.items, pagination: result.pagination });
});
exports.getBusinessByIdForAdmin = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const business = await logService.getBusinessByIdForAdmin(req.params.businessId);
    (0, apiResponse_1.sendSuccess)(res, { message: "Business retrieved successfully", data: business });
});
exports.verifyBusiness = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const business = await logService.verifyBusiness(req.params.businessId, req.body.verified ?? true);
    (0, apiResponse_1.sendSuccess)(res, { message: "Business verification updated successfully", data: business });
});
exports.updateBusinessStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const business = await logService.updateBusinessStatus(req.params.businessId, req.body.status);
    (0, apiResponse_1.sendSuccess)(res, { message: "Business status updated successfully", data: business });
});
exports.getProductsForAdmin = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await logService.getProducts(req.query.page, req.query.limit, req.query.status);
    (0, apiResponse_1.sendSuccess)(res, { message: "Products retrieved successfully", data: result.items, pagination: result.pagination });
});
exports.getProductByIdForAdmin = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const product = await logService.getProductByIdForAdmin(req.params.productId);
    (0, apiResponse_1.sendSuccess)(res, { message: "Product retrieved successfully", data: product });
});
exports.updateProductStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const product = await logService.updateProductStatus(req.params.productId, req.body.status);
    (0, apiResponse_1.sendSuccess)(res, { message: "Product status updated successfully", data: product });
});
exports.getOrdersAdmin = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await logService.getOrders(req.query.page, req.query.limit, req.query.status);
    (0, apiResponse_1.sendSuccess)(res, { message: "Orders retrieved successfully", data: result.items, pagination: result.pagination });
});
exports.getOrderByIdAdmin = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const order = await logService.getOrderByIdForAdmin(req.params.orderId);
    (0, apiResponse_1.sendSuccess)(res, { message: "Order retrieved successfully", data: order });
});
exports.updateAdminOrderStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const order = await logService.updateAdminOrderStatus(req.params.orderId, req.body.status);
    (0, apiResponse_1.sendSuccess)(res, { message: "Order status updated successfully", data: order });
});
exports.getRefundRequestsAdmin = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await logService.getRefundRequestsAdmin(req.query.page, req.query.limit, req.query.status);
    (0, apiResponse_1.sendSuccess)(res, { message: "Refund requests retrieved successfully", data: result.items, pagination: result.pagination });
});
exports.updateRefundStatusAdmin = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await logService.updateRefundStatusAdmin(req.params.refundRequestId, req.body.status);
    (0, apiResponse_1.sendSuccess)(res, { message: "Refund request status updated successfully", data: result });
});
exports.getDashboardSummary = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const summary = await logService.getDashboardSummary();
    (0, apiResponse_1.sendSuccess)(res, { message: "Dashboard summary retrieved successfully", data: summary });
});
exports.getMetrics = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const metrics = await logService.getMetrics();
    (0, apiResponse_1.sendSuccess)(res, { message: "System metrics retrieved successfully", data: metrics });
});
exports.getSettings = (0, catchAsync_1.catchAsync)(async (_req, res) => {
    const settings = await logService.getSettings();
    (0, apiResponse_1.sendSuccess)(res, { message: "Settings retrieved successfully", data: settings });
});
exports.updateSettings = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await logService.updateSettings(req.body.key, req.body.value);
    (0, apiResponse_1.sendSuccess)(res, { message: "Setting updated successfully", data: result });
});

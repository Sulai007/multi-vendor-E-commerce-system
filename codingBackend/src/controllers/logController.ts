import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../utils/apiResponse";
import * as logService from "../services/adminService";

export const getApiLogs = catchAsync(async (req: Request, res: Response) => {
    const result = await logService.getApiLogs(req.query.page, req.query.limit);
    sendSuccess(res, {
        message: "API logs retrieved successfully",
        data: { logs: result.items },
        pagination: result.pagination,
    });
});

export const updatePassword = catchAsync(async (req: Request, res: Response) => {
    await logService.updatePassword(req.body.password);
    sendSuccess(res, { message: "Password set successfully"} )
    });

export const getUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await logService.getUsers(req.query.page, req.query.limit, req.query.role as string | undefined);
    sendSuccess(res, { message: "Users retrieved successfully", data: result.items, pagination: result.pagination });
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
    const user = await logService.getUserById(req.params.userId as string);
    sendSuccess(res, { message: "User retrieved successfully", data: user });
});

export const updateUserRole = catchAsync(async (req: Request, res: Response) => {
    const adminId = req.user?.sub as string;
    const user = await logService.updateUserRole(adminId, req.params.userId as string, req.body.role);
    sendSuccess(res, { message: "User role updated successfully", data: user });
});

export const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const adminId = req.user?.sub as string;
    const user = await logService.updateUserStatus(adminId, req.params.userId as string, req.body.isActive);
    sendSuccess(res, { message: "User status updated successfully", data: user });
});

export const getBusinessesForAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await logService.getBusinesses(req.query.page, req.query.limit, req.query.status as string | undefined);
    sendSuccess(res, { message: "Businesses retrieved successfully", data: result.items, pagination: result.pagination });
});

export const getBusinessByIdForAdmin = catchAsync(async (req: Request, res: Response) => {
    const business = await logService.getBusinessByIdForAdmin(req.params.businessId as string);
    sendSuccess(res, { message: "Business retrieved successfully", data: business });
});

export const verifyBusiness = catchAsync(async (req: Request, res: Response) => {
    const business = await logService.verifyBusiness(req.params.businessId as string, req.body.verified ?? true);
    sendSuccess(res, { message: "Business verification updated successfully", data: business });
});

export const updateBusinessStatus = catchAsync(async (req: Request, res: Response) => {
    const business = await logService.updateBusinessStatus(req.params.businessId as string, req.body.status);
    sendSuccess(res, { message: "Business status updated successfully", data: business });
});

export const getProductsForAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await logService.getProducts(req.query.page, req.query.limit, req.query.status as string | undefined);
    sendSuccess(res, { message: "Products retrieved successfully", data: result.items, pagination: result.pagination });
});

export const getProductByIdForAdmin = catchAsync(async (req: Request, res: Response) => {
    const product = await logService.getProductByIdForAdmin(req.params.productId as string);
    sendSuccess(res, { message: "Product retrieved successfully", data: product });
});

export const updateProductStatus = catchAsync(async (req: Request, res: Response) => {
    const product = await logService.updateProductStatus(req.params.productId as string, req.body.status);
    sendSuccess(res, { message: "Product status updated successfully", data: product });
});

export const getOrdersAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await logService.getOrders(req.query.page, req.query.limit, req.query.status as string | undefined);
    sendSuccess(res, { message: "Orders retrieved successfully", data: result.items, pagination: result.pagination });
});

export const getOrderByIdAdmin = catchAsync(async (req: Request, res: Response) => {
    const order = await logService.getOrderByIdForAdmin(req.params.orderId as string);
    sendSuccess(res, { message: "Order retrieved successfully", data: order });
});

export const updateAdminOrderStatus = catchAsync(async (req: Request, res: Response) => {
    const order = await logService.updateAdminOrderStatus(req.params.orderId as string, req.body.status);
    sendSuccess(res, { message: "Order status updated successfully", data: order });
});

export const getRefundRequestsAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await logService.getRefundRequestsAdmin(req.query.page, req.query.limit, req.query.status as string | undefined);
    sendSuccess(res, { message: "Refund requests retrieved successfully", data: result.items, pagination: result.pagination });
});

export const updateRefundStatusAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await logService.updateRefundStatusAdmin(req.params.refundRequestId as string, req.body.status);
    sendSuccess(res, { message: "Refund request status updated successfully", data: result });
});

export const getDashboardSummary = catchAsync(async (_req: Request, res: Response) => {
    const summary = await logService.getDashboardSummary();
    sendSuccess(res, { message: "Dashboard summary retrieved successfully", data: summary });
});

export const getMetrics = catchAsync(async (_req: Request, res: Response) => {
    const metrics = await logService.getMetrics();
    sendSuccess(res, { message: "System metrics retrieved successfully", data: metrics });
});

export const getSettings = catchAsync(async (_req: Request, res: Response) => {
    const settings = await logService.getSettings();
    sendSuccess(res, { message: "Settings retrieved successfully", data: settings });
});

export const updateSettings = catchAsync(async (req: Request, res: Response) => {
    const result = await logService.updateSettings(req.body.key, req.body.value);
    sendSuccess(res, { message: "Setting updated successfully", data: result });
});

import { Request, Response} from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import * as vendorService from "../services/vendorService"; 
//import { User } from "../models";
import {logger} from "../utils/logger";

export const createBusiness = catchAsync(async (req: Request, res: Response) => {
    
    const business = await vendorService.createBusiness(req.body, req.user?.email as string);

    sendSuccess(res, {
        message: "Business registered successfully.",
        data: business,
    });
});

export const getBusinessProfile = catchAsync(async (req: Request, res: Response) => {
    
    const business = await vendorService.getBusinessProfile(req.params.id as string);
    sendSuccess(res, {
        statusCode: 200,
        message: "business profile fetched successfully.",
        data: business,
    });
});


export const updateBusiness = catchAsync(async (req: Request, res: Response) => {
    const businessId = req.params.id as string;
    const authenticatedUserId = req.user?.sub as string;
    const { businessName, description } = req.body;
    if (!businessName && !description) {
        throw new ApiError(400, "At least one field (businessName or description) must be provided for update");
    }
    const updatedBusiness = await vendorService.updateBusiness(authenticatedUserId, businessId, req.body);
    sendSuccess(res, {
        statusCode: 200,
        message: "Business updated successfully.",
        data: updatedBusiness,
    });
});



export const getBusinessProducts = catchAsync(async (req: Request, res: Response) => {
    // if (req.user?.role === "vendor" && req.user?.sub !== req.params.id) {
    //     throw new ApiError(403, "You are not authorized to fetch these products.");
    // }
    const result = await vendorService.getBusinessProducts(
        req.params.businessId as string,
        req.query.page,
        req.query.limit
    );
    sendSuccess(res, {
        statusCode: 200,
        message: "Vendor products fetched successfully.",
        data: result.items,
        pagination: result.pagination,
    });
});

export const addProduct = catchAsync(async (req: Request, res: Response) => {
    const { name, description, price, quantity, categoryIds} = req.body;
    const file = req.file
    if (!name || !description || !price || !quantity ) {
        throw new ApiError(400, "Missing required fields: name, description, price, quantity");
    }

    if(!file){
        throw new ApiError(400, "please include a product image")
    }

    const data = {
        name,
        description,
        price,
        quantity,
        categoryIds,
        file
    }
    const product = await vendorService.addProduct(req.params.businessId as string, data);
    sendSuccess(res, {
        statusCode: 201,
        message: "Product added successfully.",
        data: product,
    });
});

export const updateProduct = catchAsync(
    async (req: Request, res: Response) => {
        
        const updatedProduct = await vendorService.updateProduct(req.params.businessId as string, req.params.id as string, req.body);
        sendSuccess(
            res, {
                statusCode: 200,
                message: "product updated successfully",
                data: updatedProduct
            }

        )
    }
)

export const deleteProduct = catchAsync(
    async (req: Request, res: Response) => {
        const deletedProduct = await vendorService.deleteProduct(req.params.id as string, req.params.businessId as string)
        sendSuccess(
            res, {
                statusCode: 200,
                message: "product deleted successfully",
                data: deletedProduct
            }
        )
    });

export const getOrderByStatus = catchAsync( async ( req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    const id = req.params.businessId as string;

const result = await vendorService.getOrderByStatus(id, status, req.query.page, req.query.limit)
sendSuccess(res,
    {
        statusCode: 200,
        message: "products fetched successfully",
        data: result.items,
        pagination: result.pagination,
    }
)
});

export const updateOrderStatus = catchAsync( async (req: Request, res: Response) => {
    const orderItem = await vendorService.updateOrderStatus(
        req.params.itemId as string,
        req.params.businessId as string,
        req.body.status
    );

    sendSuccess(res, {
        statusCode: 200,
        message: "Order status updated successfully.",
        data: orderItem,
    });
})

export const getRefundRequests = catchAsync(async(req: Request, res: Response) => {
    const result = await vendorService.getRefundRequests(
        req.user?.sub as string,
        req.params.businessId as string,
        req.query.status as import("../models/orderItem").refundStatus | undefined,
        req.query.page,
        req.query.limit
    );

    sendSuccess(res, {
        statusCode: 200,
        message: "Refund requests fetched successfully",
        data: result.items,
        pagination: result.pagination,
    });
});

export const updateRefundStatus = catchAsync(async(req: Request, res: Response) => {
    const result = await vendorService.updateRefundStatus(
        req.user?.sub as string,
        req.params.businessId as string,
        req.params.refundRequestId as string,
        req.body.status
    );

    sendSuccess(res, {
        statusCode: 200,
        message: "Refund status updated successfully",
        data: result,
    });
});
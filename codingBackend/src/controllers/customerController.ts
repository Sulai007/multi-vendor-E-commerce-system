import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import * as customerService from "../services/customerService"


export const getBusinesses = 
catchAsync(
                async (req: Request, res: Response) =>
                    {
            const result = await customerService.getBusinesses(req.query.page, req.query.limit)
            sendSuccess(
                res,{
                statusCode: 202,
                message: "Businesses retrieved successfulyy",
                data: result.items,
                pagination: result.pagination,
                });


       });

export const getBusinessById = 
catchAsync(
    async(req: Request, res: Response) => {
        const id = req.params.businessId as string;
        const business = await customerService.getBusinessById(id)
        sendSuccess(
            res,
            {
                statusCode: 202,
                message: "Business fetched successfully",
                data: business
            }
        )
    }
    )    


export const getBusinessProducts = catchAsync(
async(req: Request, res: Response) => {
    const id = req.params.businessId as string
    const result = await customerService.getBusinessProducts(id, req.query.page, req.query.limit)

    sendSuccess(
        res,
        {
            statusCode: 202,
                message: "Business Products fetched successfully",
                data: result.items,
                pagination: result.pagination,
        }
    )
}

);

export const getProductsByCategory = catchAsync(async(req: Request, res: Response) => {
    const result = await customerService.getProductsByCategory(
        req.params.categoryId as string,
        req.query.page,
        req.query.limit
    );

    sendSuccess(res, {
        statusCode: 200,
        message: "Category products fetched successfully",
        data: result.items,
        pagination: result.pagination,
    });
});

export const searchProducts = catchAsync(async (req: Request, res: Response) => {
    const result = await customerService.searchProducts(
        (req.query.q as string).trim(),
        req.query.page,
        req.query.limit
    );

    sendSuccess(res, {
        message: "Products found successfully",
        data: result.items,
        pagination: result.pagination,
    });
});

export const getBusinessProductById = catchAsync(
    async(req: Request, res: Response) => {
        const businessId = req.params.businessId as string;
        const productId =  req.params.productId as string ;

        const product = await customerService.getBusinessProductById(businessId, productId);
        sendSuccess(
            res,
            {
                statusCode: 202,
                message: "Product fecthed successfully",
                data: product
            }
        )
    }
);

export const createOrder = catchAsync(
    async(req: Request, res: Response) => {
       const id = req.user?.sub as string;
       const items = req.body;

       const order = await customerService.createOrder(id, items);

       sendSuccess(
        res,
        {
            statusCode: 200,
            message: "Order successfully created",
            data: order
        }
       )
    }
)

export const addToOrder = catchAsync(
    async(req: Request, res: Response) => {
        const orderId = req.params.orderid as string;
        const prodId =  req.params.prodId as string;

        const qty = Number(req.body.qty);

        const item = await customerService.addOrderItem(orderId, prodId, qty)
        sendSuccess(
        res,
        {
            statusCode: 200,
            message: "item successfully added to Order",
            data: item
        }
       )

    }
)

export const requestRefund = catchAsync(async(req: Request, res: Response) => {
    const result = await customerService.requestRefund(
        req.user?.sub as string,
        req.params.orderItemId as string,
        req.body.reasonNote
    );

    sendSuccess(res, {
        statusCode: 201,
        message: "Refund requested successfully",
        data: result,
    });
});

export const cancelOrder = catchAsync(async(req: Request, res: Response) => {
    const order = await customerService.cancelOrder(
        req.params.orderId as string,
        req.user?.sub as string,
        req.body.reason
    );

    sendSuccess(res, {
        statusCode: 200,
        message: "Order cancelled successfully",
        data: order,
    });
});



import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { catchAsync } from "../utils/catchAsync";
import * as customerService from "../services/customerService"


export const getBusinesses = 
catchAsync(
                async (req: Request, res: Response) =>
                    {
            const businesses = await customerService.getBusinesses()
            sendSuccess(
                res,{
                statusCode: 202,
                message: "Businesses retrieved successfulyy",
                data: businesses
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
    const businessProducts = await customerService.getBusinessProducts(id)

    sendSuccess(
        res,
        {
            statusCode: 202,
                message: "Business Products fetched successfully",
                data: businessProducts
        }
    )
}

);

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

        const qty = req.body

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



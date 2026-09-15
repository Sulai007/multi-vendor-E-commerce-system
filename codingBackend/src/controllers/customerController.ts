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

)

export const getBusinessProductById = catchAsync(
    async(req: Request, res: Response) => {
        const businessId = req.params.businessId as string;
        const productId =  req.params.productId as string ;

        const product = await customerService.getBusinessProductById(businessId, productId)
    }
)



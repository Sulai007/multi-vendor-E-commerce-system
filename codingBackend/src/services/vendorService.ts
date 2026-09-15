import { ApiError } from "../utils/apiError";
import { logger } from "../utils/logger";
import { uploadImageToCloudinary } from "../helper/fileUpolad";
import { config } from "../config/env";
import {product, vendorBusiness, User} from "../models";
import { productData, businessData, businessUpdateData, productUpdateData } from "../types/businessTypes";


export const createBusiness = async (data: businessData, email: string): Promise<object> => {
    try {
        const { businessName, description } = data;

        const user = await User.findOne({ where: { email: email } }) as User;

        const exisitingBusiness = await vendorBusiness.findOne({ where: {userId: user.id}})
        if(exisitingBusiness){
            throw new ApiError(409, "Business already exist")
        }

        logger.info(`Registering business for user: ${user.id}, email: ${user.email}, businessName: ${businessName}`);
        
       const business = await vendorBusiness.create({
            userId: user.id,
            businessName,
            description
        });

        await user.update({ role: "vendor" });

        return business.toJSON();
    } 
    catch (error) {
        logger.error("Error registering business:", error);
        throw new ApiError(500, "Failed to register business.");
    }
};

export const getBusinessProfile = async (id: string): Promise<vendorBusiness | null> => {

    return  await vendorBusiness.findByPk(id);
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


export const updateBusiness = async (id: string, businessId: string, data: businessUpdateData): Promise<vendorBusiness> => {
    try {
        const business = await vendorBusiness.findByPk(businessId);
        if(!business){
            throw new 
            ApiError(404, "business not found")
        }

        if (id !== business.userId) {
            throw new ApiError(403, "You are not authorized to update this business.");
        }

        await business?.update(data);
        return business as vendorBusiness;
    } catch (error) {
        logger.error("Error updating vendor:", error);
        throw new ApiError(500, "Failed to update vendor.");
    }
};

export const addProduct = async (id: string, data: productData): Promise<product> => {
    try {
        const { name, description, price, quantity, file } = data;
        const business = await vendorBusiness.findByPk(id);

        if(!business) {
            throw new ApiError(401, "business not found.");
        }

        const uploaded = await uploadImageToCloudinary(file, business.businessId, "products");

        const Product = await product.create({
            name,
            description,
            price,
            quantity,
            businessId: business.businessId,
            imagePublicId: uploaded.publicId,
            imageUrl: uploaded.secureUrl
        });
        return Product;
    } catch (error) {
        logger.error("Error adding product:", error);
        throw new ApiError(500, `Failed to add product: ${error instanceof Error ? error.message : "unknown error"}`);
    }
};

export const getBusinessProducts = async (businessId: string): Promise<product[]> => {
    try {
        const products = await product.findAll({ where: { businessId: businessId } });
        return products;
    } catch (error) {
        logger.error("Error fetching business products:", error);
        throw new ApiError(500, "Failed to fetch business products.");
    }
};

export const updateProduct = async(businessId: string, productId: string, data: productUpdateData): Promise<product> => {
    try{
        
        const prod = await product.findOne({ where: {
            id: productId,
            businessId: businessId
        }}) as product;
        if(!prod) {
            throw ApiError.notFound("product not found")
        }
        await prod.update(data);

        return prod;
    } catch(error){
        logger.error("Error updating Product: ", error)
        throw ApiError.internalServerError("updating failed")
    }
};

export const deleteProduct = async(productId: string, businessId: string): Promise<product> => {
    try{


         const prod = await product.findOne({ where: { 
            id: productId,
            businessId: businessId 
        } });

        if(!prod) {
            throw ApiError.notFound("product not found")
        }
        await prod.destroy();
    

        return prod;
    
    }
    catch(error){
        logger.error("cannot delete product")
        throw ApiError.internalServerError("deleting failed", error)
    }
};
import { vendorBusiness, product, User } from "../models";
import { ApiError } from "../utils/apiError";


export const getBusinesses = async(): Promise<vendorBusiness[]> => {

    return await vendorBusiness.findAll();
}

export const getBusinessById = async(id: string): Promise<vendorBusiness> => {
    const business = await vendorBusiness.findByPk(id)
    if(!business) {
        throw new ApiError(404, "Business not found")
    }
    return business
}

export const getBusinessProducts = async(id: string): Promise<product[]> => {
    const products = await product.findAll({ where: {
        businessId: id

    },
    attributes: ['name', 'description', 'price', 'quantity', 'imageUrl']
})


    return products

}


export const getBusinessProductById = async( businessId: string, productId: string ): Promise<product> => {
      const reqProduct = await product.findOne({
        where: {
            businessId: businessId,
            id: productId
        }
      })

      if(!reqProduct){
        throw  ApiError.notFound("product not found")
      }

      return reqProduct;
}

import { vendorBusiness, product, User, OrderItem, Order, sequelize } from "../models";
import { OrderItemAttributes } from "../types/orderTypes";
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





export const addOrderItem = async (orderId: string, productId: string, qty: number) => {

    const transaction = await sequelize.transaction();

    try{
    const order = await Order.findByPk(orderId, {transaction});
    const prod = await product.findByPk(productId, { transaction }) as product;

    if(!order) throw new ApiError(404, "Order not found")

    if(!prod)
        {
        throw new ApiError(404, "Product not found")
        }

    if(prod.quantity <= 0 || prod.quantity < qty)
        {
        throw new ApiError(400, "Product out of stock")
        }
    const payload: OrderItemAttributes = {
        orderId: orderId,
        productId: prod.id,
        businessId: prod.businessId,
        name: prod.name,
        quantity: qty,
        unitPrice: prod.price
    }

    const item = await OrderItem.create(payload, { transaction })
    await prod.decrement('quantity', { by: qty, transaction })
    const additionalCost = prod.price * qty;
    order.totalAmount = Number(order.totalAmount) + additionalCost;
    await order.save( { transaction })
    await transaction.commit()

    return item;

} catch(error){
  await transaction.rollback()
  throw error;
}
};




export const createOrder = async (customerId: string, items: { productId: string, qty: number}[]) =>{
    const transaction = await sequelize.transaction();

    try{
        const user = await User.findByPk(customerId) as User;
        const order = await Order.create({
            customerId: customerId,
            totalAmount: 0,
            shippingAddress: user.address
        }, {transaction})

        let runningTotal = 0;


        for (const item of items){
            const prod = await product.findByPk(item.productId, {transaction});
            if(!prod) throw new ApiError(404, "product not found")
            if(prod.quantity <= 0 || prod.quantity < item.qty) throw new ApiError(400, "product out of stock")

            runningTotal += (prod.price * item.qty )

        const payload: OrderItemAttributes = {
        orderId: order.id,
        productId: prod.id,
        businessId: prod.businessId,
        name: prod.name,
        quantity: item.qty,
        unitPrice: prod.price
    }

            await OrderItem.create(payload, { transaction });
            await prod.decrement('quantity', { by: item.qty, transaction })
        }

            order.totalAmount = runningTotal;
            await order.save({transaction});
            await transaction.commit();
            return order;

        


    } catch(error){
        await transaction.rollback
        throw error;
    }
    
};




import { Op } from "sequelize";
import { vendorBusiness, product, User, OrderItem, Order, sequelize, Category, ReturnRequest } from "../models";
import { OrderItemAttributes } from "../types/orderTypes";
import { ApiError } from "../utils/apiError";
import { getPagination, getPaginationMetadata } from "../utils/pagination";
import { sendEmailSafely } from "../email/mailDelivery";
import {
    sendCustomerOrderCancellationEmail,
    sendCustomerOrderConfirmationEmail,
    sendCustomerRefundRequestReceivedEmail,
} from "../email/customerEmail";
import { sendVendorNewOrderEmail, sendVendorOrderCancellationEmail, sendVendorRefundRequestEmail } from "../email/vendorEmail";
import {
    getCache,
    invalidateCatalogCache,
    invalidateVendorBusinessCache,
    setCache,
} from "./cacheService";

type OrderLineEmailData = {
    name: string;
    quantity: number;
    unitPrice: number;
};

export const getBusinesses = async(pageValue: unknown, limitValue: unknown) => {
    const { page, limit, offset } = getPagination(pageValue, limitValue);
    const cacheKey = `catalog:businesses:${page}:${limit}`;
    const cachedBusinesses = await getCache<{
        items: vendorBusiness[];
        pagination: ReturnType<typeof getPaginationMetadata>;
    }>(cacheKey);
    if (cachedBusinesses !== null) {
        return cachedBusinesses;
    }

    const result = await vendorBusiness.findAndCountAll({
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });

    const businesses = {
        items: result.rows,
        pagination: getPaginationMetadata(page, limit, result.count),
    };
    await setCache(cacheKey, businesses);
    return businesses;
}

export const getBusinessById = async(id: string): Promise<vendorBusiness> => {
    const cacheKey = `catalog:business:${id}`;
    const cachedBusiness = await getCache<vendorBusiness>(cacheKey);
    if (cachedBusiness !== null) {
        return cachedBusiness;
    }

    const business = await vendorBusiness.findByPk(id, {
        include: [{
            model: product,
            as: "product",
        }],
    });
    if(!business) {
        throw new ApiError(404, "Business not found")
    }
    await setCache(cacheKey, business);
    return business
}

export const getBusinessProducts = async(id: string, pageValue: unknown, limitValue: unknown) => {
    const { page, limit, offset } = getPagination(pageValue, limitValue);
    const cacheKey = `catalog:business:${id}:products:${page}:${limit}`;
    const cachedProducts = await getCache<{
        items: product[];
        pagination: ReturnType<typeof getPaginationMetadata>;
    }>(cacheKey);
    if (cachedProducts !== null) {
        return cachedProducts;
    }

    const result = await product.findAndCountAll({
        where: { businessId: id },
        attributes: ["id", "businessId", "name", "description", "price", "quantity", "imageUrl", "categoryNames"],
        include: [{ model: vendorBusiness, as: "vendorBusiness", attributes: ["businessId", "businessName", "description"] }],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });

    const products = {
        items: result.rows,
        pagination: getPaginationMetadata(page, limit, result.count),
    };
    await setCache(cacheKey, products);
    return products;
}

export const searchProducts = async(search: string, pageValue: unknown, limitValue: unknown) => {
    const { page, limit, offset } = getPagination(pageValue, limitValue);
    const cacheKey = `catalog:search:${encodeURIComponent(search.toLowerCase())}:${page}:${limit}`;
    const cachedProducts = await getCache<{
        items: product[];
        pagination: ReturnType<typeof getPaginationMetadata>;
    }>(cacheKey);
    if (cachedProducts !== null) {
        return cachedProducts;
    }

    const result = await product.findAndCountAll({
        where: {
            [Op.or]: [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
            ],
        },
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });

    const products = {
        items: result.rows,
        pagination: getPaginationMetadata(page, limit, result.count),
    };
    await setCache(cacheKey, products);
    return products;

}


export const getBusinessProductById = async( businessId: string, productId: string ): Promise<product> => {
      const cacheKey = `catalog:product:${businessId}:${productId}`;
      const cachedProduct = await getCache<product>(cacheKey);
      if (cachedProduct !== null) {
        return cachedProduct;
      }

      const reqProduct = await product.findOne({
        where: {
            businessId: businessId,
            id: productId
            },
            include: [{ model: vendorBusiness, as: "vendorBusiness", attributes: ["businessId", "businessName", "description"] }],
      })

      if(!reqProduct){
        throw  ApiError.notFound("product not found")
      }

      await setCache(cacheKey, reqProduct);
      return reqProduct;
}

export const getProductsByCategory = async(categoryId: string, pageValue: unknown, limitValue: unknown) => {
    const category = await Category.findByPk(categoryId);
    if (!category) {
        throw ApiError.notFound("Product category not found");
    }

    const { page, limit, offset } = getPagination(pageValue, limitValue);
    const cacheKey = `catalog:category:${categoryId}:products:${page}:${limit}`;
    const cachedProducts = await getCache<{
        items: product[];
        pagination: ReturnType<typeof getPaginationMetadata>;
    }>(cacheKey);
    if (cachedProducts !== null) {
        return cachedProducts;
    }

    const result = await product.findAndCountAll({
        where: { categoryNames: { [Op.contains]: [category.category] } },
        include: [{ model: vendorBusiness, as: "vendorBusiness", attributes: ["businessId", "businessName", "description"] }],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });

    const products = {
        items: result.rows,
        pagination: getPaginationMetadata(page, limit, result.count),
    };
    await setCache(cacheKey, products);
    return products;
};

export const requestRefund = async(customerId: string, orderItemId: string, reasonNote: string) => {
    const transaction = await sequelize.transaction();

    try {
        const orderItem = await OrderItem.findByPk(orderItemId, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });
        if (!orderItem) {
            throw ApiError.notFound("Order item not found");
        }

        const order = await Order.findOne({
            where: { id: orderItem.orderId, customerId },
            transaction,
        });
        if (!order) {
            throw ApiError.notFound("Order item not found");
        }
        if (orderItem.refundStatus !== "none") {
            throw ApiError.conflict("A refund request already exists or this item is not eligible");
        }

        const refundRequest = await ReturnRequest.create({
            orderItemId: orderItem.id,
            customerId,
            businessId: orderItem.businessId,
            reasonNote,
        }, { transaction });
        await orderItem.update({ refundStatus: "requested" }, { transaction });
        await transaction.commit();

        await sendEmailSafely(async () => {
            const customer = await User.findByPk(customerId);
            if (customer) {
                await sendCustomerRefundRequestReceivedEmail({
                    to: customer.email,
                    firstName: customer.firstName,
                    refundRequestId: refundRequest.id,
                    itemName: orderItem.name,
                    reasonNote,
                });
            }
        });
        await sendEmailSafely(async () => {
            const business = await vendorBusiness.findByPk(orderItem.businessId);
            const owner = business ? await User.findByPk(business.userId) : null;
            if (business && owner) {
                await sendVendorRefundRequestEmail({
                    to: owner.email,
                    vendorName: owner.firstName,
                    businessName: business.businessName,
                    customerName: "A customer",
                    refundRequestId: refundRequest.id,
                    itemName: orderItem.name,
                    reasonNote,
                });
            }
        });

        return { refundRequest, orderItem };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const cancelOrder = async (orderId: string, customerId: string, reason?: string) => {
    const order = await Order.findOne({
        where: { id: orderId, customerId },
    });

    if (!order) {
        throw ApiError.notFound("Order not found");
    }

    if (order.isCancelled) {
        throw ApiError.conflict("This order has already been cancelled");
    }

    if (["shipped", "delivered"].includes(order.orderStatus as string)) {
        throw ApiError.conflict("This order cannot be cancelled after it has been shipped or delivered");
    }

    order.isCancelled = true;
    order.cancelledAt = new Date();
    order.cancelReason = reason ?? "Customer cancelled this order";
    order.orderStatus = "cancelled";
    await order.save();

    await sendEmailSafely(async () => {
        const customer = await User.findByPk(customerId);
        if (customer) {
            await sendCustomerOrderCancellationEmail({
                to: customer.email,
                firstName: customer.firstName,
                orderId: order.id,
                reason: order.cancelReason ?? undefined,
            });
        }
    });
    await sendEmailSafely(async () => {
        const items = await OrderItem.findAll({ where: { orderId } });
        const itemsByBusiness = new Map<string, string[]>();
        for (const item of items) {
            const businessItems = itemsByBusiness.get(item.businessId) ?? [];
            businessItems.push(item.name);
            itemsByBusiness.set(item.businessId, businessItems);
        }

        await Promise.all(Array.from(itemsByBusiness, async ([businessId, itemNames]) => {
            await sendEmailSafely(async () => {
                const business = await vendorBusiness.findByPk(businessId);
                const owner = business ? await User.findByPk(business.userId) : null;
                if (business && owner) {
                    await sendVendorOrderCancellationEmail({
                        to: owner.email,
                        vendorName: owner.firstName,
                        businessName: business.businessName,
                        orderId: order.id,
                        items: itemNames,
                        reason: order.cancelReason ?? undefined,
                    });
                }
            });
        }));
    });

    return order;
};

export const addOrderItem = async (orderId: string, productId: string, qty: number) => {

    const transaction = await sequelize.transaction();
    let transactionCommitted = false;

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
    transactionCommitted = true;

    await Promise.all([
        invalidateCatalogCache(),
        invalidateVendorBusinessCache(prod.businessId),
    ]);
    return item;

} catch(error){
  if (!transactionCommitted) {
    await transaction.rollback();
  }
  throw error;
}
};




export const createOrder = async (customerId: string, items: { productId: string, qty: number}[]) =>{
    const transaction = await sequelize.transaction();
    let transactionCommitted = false;

    try{
        const user = await User.findByPk(customerId) as User;
        const order = await Order.create({
            customerId: customerId,
            totalAmount: 0,
            shippingAddress: user.address
        }, {transaction})

        let runningTotal = 0;
        const itemsByBusiness = new Map<string, OrderLineEmailData[]>();


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
            const businessItems = itemsByBusiness.get(prod.businessId) ?? [];
            businessItems.push({ name: prod.name, quantity: item.qty, unitPrice: prod.price });
            itemsByBusiness.set(prod.businessId, businessItems);
            await prod.decrement('quantity', { by: item.qty, transaction })
        }

            order.totalAmount = runningTotal;
            await order.save({transaction});
            await transaction.commit();
            transactionCommitted = true;
            await Promise.all([
                invalidateCatalogCache(),
                ...Array.from(itemsByBusiness.keys(), (businessId) => invalidateVendorBusinessCache(businessId)),
            ]);

            await sendEmailSafely(() => sendCustomerOrderConfirmationEmail({
                to: user.email,
                firstName: user.firstName,
                orderId: order.id,
                items: Array.from(itemsByBusiness.values()).flat(),
                totalAmount: runningTotal,
                shippingAddress: user.address,
            }));
            await Promise.all(Array.from(itemsByBusiness, async ([businessId, businessItems]) => {
                await sendEmailSafely(async () => {
                    const business = await vendorBusiness.findByPk(businessId);
                    const owner = business ? await User.findByPk(business.userId) : null;
                    if (business && owner) {
                        const businessTotal = businessItems.reduce(
                            (total, item) => total + item.quantity * item.unitPrice,
                            0,
                        );
                        await sendVendorNewOrderEmail({
                            to: owner.email,
                            vendorName: owner.firstName,
                            businessName: business.businessName,
                            orderId: order.id,
                            items: businessItems,
                            totalAmount: businessTotal,
                            shippingAddress: user.address,
                        });
                    }
                });
            }));
            return order;

        


    } catch(error){
        if (!transactionCommitted) {
            await transaction.rollback();
        }
        throw error;
    }
    
};


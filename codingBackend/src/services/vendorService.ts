import { ApiError } from "../utils/apiError";
import { logger } from "../utils/logger";
import { uploadImageToCloudinary } from "../helper/fileUpolad";
import { config } from "../config/env";
import {product, vendorBusiness, User, Order, OrderItem, Category, ReturnRequest, sequelize} from "../models";
import { productData, businessData, businessUpdateData, productUpdateData } from "../types/businessTypes";
import { itemStatus, refundStatus } from "../models/orderItem";
import { refundStatusTransitions } from "../types/lifecycle";
import { getPagination, getPaginationMetadata } from "../utils/pagination";
import { sendBusinessApplicationReceivedEmail, sendAdminBusinessApplicationEmail } from "../email/businessEmail";
import { sendEmailSafely } from "../email/mailDelivery";
import { sendCustomerOrderStatusEmail, sendCustomerRefundStatusEmail } from "../email/customerEmail";
import { sendAdminRefundEscalationEmail } from "../email/adminEmail";
import {
    getCache,
    invalidateCatalogCache,
    invalidateVendorBusinessCache,
    setCache,
} from "./cacheService";


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
        await invalidateCatalogCache();

        await sendEmailSafely(() => sendBusinessApplicationReceivedEmail({
            to: user.email,
            firstName: user.firstName,
            businessName: business.businessName,
        }));
        await sendEmailSafely(async () => {
            const admins = await User.findAll({ where: { role: "admin", isActive: true } });
            await Promise.all(admins.map((admin) => sendEmailSafely(() => sendAdminBusinessApplicationEmail({
                to: admin.email,
                applicantName: `${user.firstName} ${user.lastName}`,
                applicantEmail: user.email,
                businessName: business.businessName,
                description: business.description,
            }))));
        });

        return business.toJSON();
    } 
    catch (error) {
        logger.error("Error registering business:", error);
        throw new ApiError(500, "Failed to register business.");
    }
};

export const getBusinessProfile = async (id: string): Promise<vendorBusiness> => {

    const cacheKey = `vendor:${id}:profile`;
    const cachedProfile = await getCache<vendorBusiness>(cacheKey);

    if (cachedProfile !== null) {
        return cachedProfile;
    }

    const business = await vendorBusiness.findByPk(id, {
        include: [
            { model: product, as: "product" },
            { model: User, as: "user", attributes: ["id", "firstName", "lastName", "email", "role"] },
        ],
    });

    if (!business) {
        throw ApiError.notFound("Business not found.");
    }

    await setCache(cacheKey, business, 600);

    return business;

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
        await Promise.all([
            invalidateCatalogCache(),
            invalidateVendorBusinessCache(businessId),
        ]);
        return business as vendorBusiness;
    } catch (error) {
        logger.error("Error updating vendor:", error);
        throw new ApiError(500, "Failed to update vendor.");
    }
};

export const addProduct = async (id: string, data: productData): Promise<product> => {
    try {
        const { name, description, price, quantity, categoryIds = [], file } = data;
        const business = await vendorBusiness.findByPk(id);

        if(!business) {
            throw new ApiError(401, "business not found.");
        }

        const uniqueCategoryIds = [...new Set(categoryIds)];
        const categories = uniqueCategoryIds.length
            ? await Category.findAll({ where: { id: uniqueCategoryIds } })
            : [];
        if (categories.length !== uniqueCategoryIds.length) {
            throw new ApiError(400, "One or more product categories do not exist.");
        }

        const uploaded = await uploadImageToCloudinary(file, business.businessId, "products");

        const Product = await product.create({
            name,
            description,
            price,
            quantity,
            businessId: business.businessId,
            categoryNames: categories.map((category) => category.category),
            imagePublicId: uploaded.publicId,
            imageUrl: uploaded.secureUrl
        });
        if (categories.length) {
            await Product.setCategories(categories);
        }
        await Promise.all([
            invalidateCatalogCache(),
            invalidateVendorBusinessCache(business.businessId),
        ]);
        return Product;
    } catch (error) {
        logger.error("Error adding product:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, `Failed to add product: ${error instanceof Error ? error.message : "unknown error"}`);
    }
};

export const getBusinessProducts = async (businessId: string, pageValue: unknown, limitValue: unknown) => {
    try {
        const { page, limit, offset } = getPagination(pageValue, limitValue);
        const cacheKey = `vendor:${businessId}:products:${page}:${limit}`;
        const cachedProducts = await getCache<{
            items: product[];
            pagination: ReturnType<typeof getPaginationMetadata>;
        }>(cacheKey);
        if (cachedProducts !== null) {
            return cachedProducts;
        }

        const result = await product.findAndCountAll({
            where: { businessId },
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
        const { categoryIds, ...productFields } = data;
        let categories: Category[] | undefined;
        if (categoryIds !== undefined) {
            const uniqueCategoryIds = [...new Set(categoryIds)];
            categories = uniqueCategoryIds.length
                ? await Category.findAll({ where: { id: uniqueCategoryIds } })
                : [];
            if (categories.length !== uniqueCategoryIds.length) {
                throw new ApiError(400, "One or more product categories do not exist.");
            }
        }
        const categoryNames = categories?.map((category) => category.category);
        if (Object.keys(productFields).length) {
            await prod.update(productFields);
        }
        if (categories !== undefined) {
            await prod.setCategories(categories);
            await prod.update({ categoryNames });
        }

        await Promise.all([
            invalidateCatalogCache(),
            invalidateVendorBusinessCache(businessId),
        ]);
        return prod;
    } catch(error){
        logger.error("Error updating Product: ", error)
        if (error instanceof ApiError) {
            throw error;
        }
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
        await Promise.all([
            invalidateCatalogCache(),
            invalidateVendorBusinessCache(businessId),
        ]);

        return prod;
    
    }
    catch(error){
        logger.error("cannot delete product")
        throw ApiError.internalServerError("deleting failed", error)
    }
};

export const getOrderByStatus = async(businessId: string, status: string | undefined, pageValue: unknown, limitValue: unknown) => {
            const { page, limit, offset } = getPagination(pageValue, limitValue);
            const result = await OrderItem.findAndCountAll({
                where: status ? { businessId, itemStatus: status } : { businessId },
                limit,
                offset,
                order: [["createdAt", "DESC"]],
            });

            return {
                items: result.rows,
                pagination: getPaginationMetadata(page, limit, result.count),
            };
};

export const updateOrderStatus = async(itemId: string, businessId: string, status: itemStatus) =>
{
    const order = await OrderItem.findOne({
        where:
        {
            id: itemId,
            businessId: businessId,

        }
    })
    if(!order){
        throw new ApiError(404, "order not found")
    }

    const statusChanged = order.itemStatus !== status;
    await order.update({ itemStatus: status });

    if (statusChanged) {
        await sendEmailSafely(async () => {
            const parentOrder = await Order.findByPk(order.orderId);
            const customer = parentOrder ? await User.findByPk(parentOrder.customerId) : null;
            if (parentOrder && customer) {
                await sendCustomerOrderStatusEmail({
                    to: customer.email,
                    firstName: customer.firstName,
                    orderId: parentOrder.id,
                    itemName: order.name,
                    status,
                });
            }
        });
    }

    return order;
}

export const getRefundRequests = async(userId: string, businessId: string, status: refundStatus | undefined, pageValue: unknown, limitValue: unknown) => {
    const business = await vendorBusiness.findOne({ where: { businessId, userId } });
    if (!business) {
        throw ApiError.notFound("Business not found");
    }

    const { page, limit, offset } = getPagination(pageValue, limitValue);
    const result = await ReturnRequest.findAndCountAll({
        where: { businessId },
        include: [
            {
                model: OrderItem,
                as: "orderItem",
                ...(status ? { where: { refundStatus: status }, required: true } : {}),
            },
            { model: User, as: "customer", attributes: ["id", "firstName", "lastName", "email"] },
        ],
        distinct: true,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
    });

    return {
        items: result.rows,
        pagination: getPaginationMetadata(page, limit, result.count),
    };
};

export const updateRefundStatus = async(userId: string, businessId: string, refundRequestId: string, status: Exclude<refundStatus, "none" | "requested">) => {
    const transaction = await sequelize.transaction();

    try {
        const business = await vendorBusiness.findOne({ where: { businessId, userId }, transaction });
        if (!business) {
            throw ApiError.notFound("Business not found");
        }

        const refundRequest = await ReturnRequest.findOne({
            where: { id: refundRequestId, businessId },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });
        if (!refundRequest) {
            throw ApiError.notFound("Refund request not found");
        }

        const orderItem = await OrderItem.findByPk(refundRequest.orderItemId, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });
        if (!orderItem) {
            throw ApiError.notFound("Order item not found");
        }

        const currentStatus = (orderItem.refundStatus ?? "none") as refundStatus;
        if (!refundStatusTransitions[currentStatus]?.includes(status)) {
            throw ApiError.conflict(`Cannot change refund status from ${currentStatus} to ${status}`);
        }

        await orderItem.update({ refundStatus: status }, { transaction });
        await transaction.commit();

        await sendEmailSafely(async () => {
            const customer = await User.findByPk(refundRequest.customerId);
            if (customer) {
                await sendCustomerRefundStatusEmail({
                    to: customer.email,
                    firstName: customer.firstName,
                    refundRequestId: refundRequest.id,
                    itemName: orderItem.name,
                    status,
                });
            }
        });

        if (status === "escalated") {
            await sendEmailSafely(async () => {
                const admins = await User.findAll({ where: { role: "admin", isActive: true } });
                await Promise.all(admins.map((admin) => sendEmailSafely(() => sendAdminRefundEscalationEmail({
                    to: admin.email,
                    customerName: "A customer",
                    businessName: business.businessName,
                    refundRequestId: refundRequest.id,
                    itemName: orderItem.name,
                    reasonNote: refundRequest.reasonNote,
                }))));
            });
        }

        return { refundRequest, orderItem };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
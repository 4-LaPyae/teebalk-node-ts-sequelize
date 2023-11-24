import Logger from '@freewilltokyo/logger';
import { NextFunction } from 'express';

import {
  ErrorTypeEnum,
  InstoreOrderErrorMessageEnum,
  InstoreShipOptionEnum,
  OrderItemInventoryStatusEnum,
  PurchaseItemErrorMessageEnum
} from '../../constants';
import { IProductDao } from '../../dal';
import { PRODUCT_RELATED_MODELS } from '../../dal/product/constants';
import {
  InstoreOrderGroupStatusEnum,
  IProductInventoryValidation,
  IUserShippingAddressModel,
  LockingTypeEnum,
  ProductStatusEnum
} from '../../database';
import { ApiError, TellsApiError } from '../../errors';
import { IInstoreOrderDetail, IInstoreOrderGroup, InstoreOrderService, ProductInventoryService, ProductService } from '../../services';
import { IExtendedRequest, IRequestWithUser } from '../auth';

const log = new Logger('MDW:shopInstoreOrderMiddleware');

const { colors, customParameters } = PRODUCT_RELATED_MODELS;

export const shopInstoreOrderAccessibleMiddleware = (instoreOrderService: InstoreOrderService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestOrderGroupNameId = req.params.nameId;
    const instoreOrder = await instoreOrderService.getInstoreOrderGroupByNameId(requestOrderGroupNameId);

    if (!instoreOrder) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_IS_UNAVAILABLE);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.instoreOrder = instoreOrder;
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const instoreOrderAccessibleMiddleware = (instoreOrderService: InstoreOrderService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestOrderGroupNameId = req.params.nameId;

    const instoreOrder = await instoreOrderService.getInstoreOrderGroupByNameId(requestOrderGroupNameId);
    const unavailableStatuses = [InstoreOrderGroupStatusEnum.CANCELED, InstoreOrderGroupStatusEnum.TIMEOUT];

    if (!instoreOrder) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_IS_UNAVAILABLE);
    }

    instoreOrder.errors = [];
    if (unavailableStatuses.includes(instoreOrder.status)) {
      instoreOrder.errors.push({
        type: ErrorTypeEnum.ERROR,
        value: InstoreOrderErrorMessageEnum.ORDER_IS_CANCELED
      });
    }

    if (instoreOrder.userId && instoreOrder.userId !== req.user.id) {
      instoreOrder.errors.push({
        type: ErrorTypeEnum.ERROR,
        value: InstoreOrderErrorMessageEnum.ORDER_ALREADY_ASSIGNED
      });
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.instoreOrder = instoreOrder;
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const instoreOrderCheckoutAbleMiddleware = (instoreOrderService: InstoreOrderService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestOrderGroupNameId = req.body.nameId;
    const shippingAddress: Partial<IUserShippingAddressModel> = req.body.shippingAddress;

    const instoreOrder = await instoreOrderService.getInstoreOrderGroupByNameId(requestOrderGroupNameId, shippingAddress);
    const unavailableStatuses = [InstoreOrderGroupStatusEnum.CANCELED, InstoreOrderGroupStatusEnum.TIMEOUT];

    if (!instoreOrder) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_IS_UNAVAILABLE);
    }

    if (unavailableStatuses.includes(instoreOrder.status)) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_IS_CANCELED);
    }

    if (instoreOrder.status === InstoreOrderGroupStatusEnum.COMPLETED) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_IS_COMPLETED);
    }

    if (instoreOrder.userId && instoreOrder.userId !== req.user.id) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_ALREADY_ASSIGNED);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.instoreOrder = instoreOrder;
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const instoreOrderPayableMiddleware = (instoreOrderService: InstoreOrderService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const paymentIntentId = req.body.id;
    const instoreOrder = await instoreOrderService.getInstoreOrderGroupByPaymentIntentId(paymentIntentId, true, false);

    if (!instoreOrder) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_IS_UNAVAILABLE);
    }

    const requestInstoreOrder = req.body.order as IInstoreOrderGroup;
    if (requestInstoreOrder.nameId !== instoreOrder.nameId) {
      throw TellsApiError.badRequest('This order is not mapped to payment intent');
    }

    const unavailableStatuses = [InstoreOrderGroupStatusEnum.CANCELED, InstoreOrderGroupStatusEnum.TIMEOUT];

    if (unavailableStatuses.includes(instoreOrder.status)) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_IS_CANCELED);
    }

    if (instoreOrder.status === InstoreOrderGroupStatusEnum.COMPLETED) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_IS_COMPLETED);
    }

    if (instoreOrder.userId && instoreOrder.userId !== req.user.id) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_ALREADY_ASSIGNED);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.instoreOrder = instoreOrder;
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const shopInstoreOrderEditableMiddleware = (instoreOrderService: InstoreOrderService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestOrderGroupNameId = req.params.nameId;
    const instoreOrder = await instoreOrderService.getInstoreOrderGroupByNameId(requestOrderGroupNameId, null, false);

    if (!instoreOrder) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_IS_UNAVAILABLE);
    }

    if (instoreOrder.status !== InstoreOrderGroupStatusEnum.IN_PROGRESS) {
      throw ApiError.forbidden();
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.instoreOrder = instoreOrder;
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const validatePurchaseProductMiddleware = (productService: ProductService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId: number = +req.body.productId;

    const product: any = await productService.getOneInstoreProduct({
      where: { id: productId },
      attributes: ['id', 'status', 'hasParameters'],
      include: [colors, customParameters]
    });

    if (!product) {
      throw ApiError.notFound('Product is not found');
    }

    if (product.status !== ProductStatusEnum.PUBLISHED) {
      throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PRODUCT_IS_UNAVAILABLE);
    }

    if (!['POST', 'PATCH'].includes(req.method)) {
      return next();
    }

    if (product.hasParameters) {
      const requestColorId = req.body.colorId || null;
      const requestcustomParameterId = req.body.customParameterId || null;

      const selectedParameterSet = (product as IProductDao).parameterSets.find(
        parameterSet => parameterSet.colorId === requestColorId && parameterSet.customParameterId === requestcustomParameterId
      );

      if (selectedParameterSet && !selectedParameterSet.enable) {
        throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PRODUCT_PARAMETER_SET_IS_UNAVAILABLE);
      }

      const parameters = ['color', 'customParameter'];

      for (const parameter of parameters) {
        const parameterIds: number[] = product[`${parameter}s`].map((item: { id: any }) => {
          return item.id;
        });

        const parameterId = req.body[`${parameter}Id`];

        if (parameterIds.length) {
          if (!parameterId) {
            throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.MISSING_PARAMETER);
          } else if (!parameterIds.includes(parameterId)) {
            throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PARAMETER_IS_NOT_FOUND);
          }
        } else if (parameterId !== null) {
          throw TellsApiError.conflict(PurchaseItemErrorMessageEnum.PARAMETER_IS_NOT_EXIST);
        }
      }
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const checkInstoreStockMiddleware = (
  inventoryService: ProductInventoryService,
  instoreOrderService: InstoreOrderService
): any => async (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as number;
    const requestQuantity = +req.body.quantity;

    const productId = req.body.productId;
    const colorId = req.body.colorId || null;
    const customParameterId = req.body.customParameterId || null;
    const shipOption = req.body.shipOption as InstoreShipOptionEnum;

    const inventoryValidations: IProductInventoryValidation[] = [
      {
        productId,
        colorId,
        customParameterId,
        quantity: requestQuantity,
        type: shipOption === InstoreShipOptionEnum.INSTORE ? LockingTypeEnum.STOCK : LockingTypeEnum.SHIP_LATER_STOCK
      }
    ];

    let instoreOrderGroup = null;
    const orderNameId = req.body.orderNameId ? req.body.orderNameId : req.params.nameId || null;
    if (orderNameId) {
      instoreOrderGroup = await instoreOrderService.findOneOrderGroup({
        where: { nameId: orderNameId },
        attributes: ['id']
      });
    }

    // Check stock in inventory
    const productInventoryStatus =
      shipOption === InstoreShipOptionEnum.INSTORE
        ? await inventoryService.checkQuantityStockByProductsId(inventoryValidations, userId, instoreOrderGroup?.id)
        : await inventoryService.checkQuantityShipLaterStockByProductsId(inventoryValidations, userId, instoreOrderGroup?.id);

    if (productInventoryStatus !== OrderItemInventoryStatusEnum.INSTOCK) {
      throw ApiError.badRequest(productInventoryStatus);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const InstoreOrderDetailExistenceMiddleware = (): any => (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const orderItemId = +req.params.orderDetailId;
    const existedOrderItems = req.state.instoreOrder.orderDetails as IInstoreOrderDetail[];

    if (!existedOrderItems.some(item => item.id === orderItemId)) {
      log.error(`Order item ${orderItemId} is not in list.`);
      throw TellsApiError.notFound();
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const shopInstoreOrderDeletableMiddleware = (instoreOrderService: InstoreOrderService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestOrderGroupNameId = req.params.nameId;
    const instoreOrder = await instoreOrderService.findOneOrderGroup({
      where: { nameId: requestOrderGroupNameId },
      attributes: ['id', 'nameId', 'sellerId', 'userId', 'status']
    });

    if (!instoreOrder) {
      throw ApiError.notFound();
    }

    if (instoreOrder.status === InstoreOrderGroupStatusEnum.COMPLETED) {
      throw ApiError.forbidden();
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.instoreOrder = instoreOrder;
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const addToOrderAvailableMiddleware = (): any => (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const requestQuantity = +req.body.quantity;
    const maxQuantity = 10;
    const existedOrderItems = req.state.instoreOrder.orderDetails as IInstoreOrderDetail[];

    const totalQuantityOrdering = existedOrderItems.find(
      purchaseProduct =>
        purchaseProduct.productId === req.body.productId &&
        purchaseProduct.productColorId === (req.body.colorId || null) &&
        purchaseProduct.productCustomParameterId === (req.body.customParameterId || null) &&
        purchaseProduct.shipOption === req.body.shipOption
    );

    if (requestQuantity > maxQuantity || (totalQuantityOrdering && totalQuantityOrdering.quantity + requestQuantity > maxQuantity)) {
      throw ApiError.badRequest(`Parameter "quantity" should not larger than ${maxQuantity}`);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const instoreOrderCloneAvailableMiddleware = (instoreOrderService: InstoreOrderService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestOrderGroupNameId = req.params.nameId;
    const instoreOrder = await instoreOrderService.getInstoreOrderGroupForClone(requestOrderGroupNameId);

    if (!instoreOrder) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_IS_UNAVAILABLE);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.instoreOrder = instoreOrder;
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

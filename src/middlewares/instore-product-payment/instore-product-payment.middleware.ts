import Logger from '@freewilltokyo/logger';
import { NextFunction } from 'express';

import { InstoreOrderErrorMessageEnum, InstoreShipOptionEnum } from '../../constants';
import { TellsApiError } from '../../errors';
import { IInstoreOrderGroup, InstoreOrderService } from '../../services';
import { IExtendedRequest } from '../auth';

const log = new Logger('MDW:InstoreProductPaymentMiddleware');

export const validateInstoreOrderMiddleware = (orderService: InstoreOrderService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const lastedInstoreOrder = req.state.instoreOrder as IInstoreOrderGroup;
    const hasError = lastedInstoreOrder.orderDetails.some(orderItem => orderItem.errors && orderItem.errors.length > 0);
    if (hasError) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_HAS_ERROR);
    }

    let requestInstoreOrder: IInstoreOrderGroup;
    if (req.body.order) {
      requestInstoreOrder = req.body.order as IInstoreOrderGroup;
    } else {
      requestInstoreOrder = req.body as IInstoreOrderGroup;
    }

    if (requestInstoreOrder.orderDetails.some(orderItem => orderItem.shipOption === InstoreShipOptionEnum.SHIP_LATER)) {
      if (!requestInstoreOrder.shippingAddress) {
        throw TellsApiError.badRequest(InstoreOrderErrorMessageEnum.REQUIRED_SHIPPING_ADDRESS);
      }

      const purchaseProductIds = [...new Set(requestInstoreOrder.orderDetails.map(orderItem => orderItem.productId))];
      const ableOverseasShipping = await orderService.checkAbleOverseasShipping(purchaseProductIds, requestInstoreOrder.shippingAddress);
      if (!ableOverseasShipping) {
        throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_NOT_ALLOW_OVERSEAS_SHIPPING);
      }
    }

    if (
      lastedInstoreOrder.amount !== requestInstoreOrder.amount ||
      lastedInstoreOrder.shippingFee !== requestInstoreOrder.shippingFee ||
      lastedInstoreOrder.totalAmount !== requestInstoreOrder.totalAmount + (requestInstoreOrder.usedCoins || 0)
    ) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_WAS_UPDATED);
    }

    if (lastedInstoreOrder.orderDetails.length !== requestInstoreOrder.orderDetails.length) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_WAS_UPDATED);
    }

    const isOrderDetailNotChanged = lastedInstoreOrder.orderDetails.every(latestOrderItem =>
      requestInstoreOrder.orderDetails.some(
        requestOrderItem =>
          requestOrderItem.productId === latestOrderItem.productId &&
          requestOrderItem.productColorId === latestOrderItem.productColorId &&
          requestOrderItem.productCustomParameterId === latestOrderItem.productCustomParameterId &&
          requestOrderItem.shipOption === latestOrderItem.shipOption &&
          requestOrderItem.productPrice === latestOrderItem.productPrice
      )
    );

    if (!isOrderDetailNotChanged) {
      throw TellsApiError.conflict(InstoreOrderErrorMessageEnum.ORDER_WAS_UPDATED);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

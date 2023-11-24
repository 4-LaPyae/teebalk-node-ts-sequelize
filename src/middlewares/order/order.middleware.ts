import Logger from '@freewilltokyo/logger';
import { NextFunction } from 'express';

import { ApiError } from '../../errors';
import { OrderService } from '../../services';
import { IExtendedRequest } from '../auth';

const log = new Logger('MDW:PaymentMiddleware');

export const orderGroupAccessMiddleware = (orderService: OrderService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { paymentIntentId } = req.params;
    const orderGroup = await orderService.getOrderGroupByPaymentIntentId(paymentIntentId);

    if (!orderGroup || orderGroup.userId !== req.user?.id) {
      return next(ApiError.notFound('Order is not found'));
    }
  } catch (err) {
    log.error(err);
    next(ApiError.internal(err.message));
  }

  next();
};

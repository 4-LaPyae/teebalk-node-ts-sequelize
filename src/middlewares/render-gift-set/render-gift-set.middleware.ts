import Logger from '@freewilltokyo/logger';
import { NextFunction, Response } from 'express';

import { LanguageEnum } from '../../constants';
import { GiftSetService } from '../../services';
import { IRequestWithUser } from '../auth';

const log = new Logger('MDW:RenderGiftSetMiddleware');

export const renderGiftSetMiddleware = (giftSetService: GiftSetService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const giftSetCode = req.params.code;
    const language = LanguageEnum.JAPANESE;

    const giftSetDetail = await giftSetService.getPublishedGiftSetDetail(giftSetCode, language);

    if (!req.state) {
      req.state = {};
    }

    req.state.giftSet = giftSetDetail;
    req.state.language = language;
  } catch (err) {
    log.error(err);
    next(err);
  }
  return next();
};

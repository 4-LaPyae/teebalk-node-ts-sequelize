import Logger from '@freewilltokyo/logger';
import { NextFunction, Response } from 'express';

import { LanguageEnum } from '../../constants';
import { AmbassadorService } from '../../services';
import { IRequestWithUser } from '../auth';

const log = new Logger('MDW:RenderAmbassadorMiddleware');

export const renderAmbassadorMiddleware = (ambassadorService: AmbassadorService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const ambassadorCode = req.params.code;
    const language = LanguageEnum.JAPANESE;

    const ambassadorDetail = await ambassadorService.getAmbassadorDetail(ambassadorCode, language);

    if (!req.state) {
      req.state = {};
    }

    req.state.ambassador = ambassadorDetail;
    req.state.language = language;
  } catch (err) {
    log.error(err);
    next(err);
  }
  return next();
};

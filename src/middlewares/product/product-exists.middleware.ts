import { ApiError } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { NextFunction, Response } from 'express';

import { LanguageEnum } from '../../constants';
import { IProductRepository } from '../../dal';
import { IExtendedRequest } from '../auth';

const log = new Logger('MDW:AssetExistsMiddleware');

/**
 * Check if asset exists in db.
 *
 * @param repository - repo
 * @param parameterName -'id' or ['parameterName', 'columnName']
 * @param attributes - ['id']
 * @param softCheck - false
 */
export const productExistenceMiddleware = (productRepository: IProductRepository, softCheck = false): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const productNameId = req.params.name_id;
    const language = (req.query.language || LanguageEnum.JAPANESE) as LanguageEnum;
    const product = await productRepository.getOneByNameId(productNameId);
    if (!product && !softCheck) {
      throw ApiError.notFound(`product not found`);
    }
    if (!req.state) {
      req.state = {};
    }
    req.state.language = language;
    req.state.product = product;
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

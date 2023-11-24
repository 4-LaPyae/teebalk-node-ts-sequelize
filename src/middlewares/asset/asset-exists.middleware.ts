import { ApiError } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { NextFunction, Response } from 'express';

import { IRepository } from '../../dal/_base';
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
export const assetExistenceMiddleware = (
  repository: IRepository<any>,
  parameterName: string | string[] = 'id',
  attributes = ['id'],
  softCheck = false
): any => async (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const asset = await (Array.isArray(parameterName)
      ? repository.findOne({ where: { [parameterName[1]]: req.params[parameterName[0]] }, attributes })
      : repository.findOne({ where: { [parameterName]: req.params[parameterName] }, attributes }));
    const modelName: string = repository.modelName;
    if (!asset && !softCheck) {
      throw ApiError.notFound(`${modelName} not found`);
    }
    if (!req.state) {
      req.state = {};
    }

    req.state[modelName] = asset;
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

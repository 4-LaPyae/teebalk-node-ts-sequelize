import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { IConfigRepository } from '../../dal/config';
import { IConfigModel, Transactional } from '../../database';
import { LogMethodSignature } from '../../logger';
import { BaseController } from '../_base/base.controller';

const log = new Logger('CTR:ConfigController');

interface IConfigControllerServices {
  configRepository: IConfigRepository;
}

export class ConfigController extends BaseController<IConfigControllerServices> {
  @LogMethodSignature(log)
  getAll(): Promise<IConfigModel[]> {
    return this.services.configRepository.findAll();
  }

  @LogMethodSignature(log)
  @Transactional
  async setPalatformFee(value: number, transaction?: Transaction): Promise<boolean> {
    await this.services.configRepository.setPlatformFee(value, transaction);
    return true;
  }
}

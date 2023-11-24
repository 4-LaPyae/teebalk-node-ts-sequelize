// import Logger from '@freewilltokyo/logger';

import { IEthicalityLevelRepository } from '../../dal';
import { IEthicalityLevelModel } from '../../database';

export interface EthicalityLevelServiceOptions {
  ethicalityLevelRepository: IEthicalityLevelRepository;
}

export class EthicalityLevelService {
  private services: EthicalityLevelServiceOptions;

  constructor(services: EthicalityLevelServiceOptions) {
    this.services = services;
  }

  async getAllList(): Promise<IEthicalityLevelModel[]> {
    const ethicalityLevelsList = await this.services.ethicalityLevelRepository.findAll({
      where: { deletedAt: null },
      attributes: ['id', 'field', 'point', 'key']
    });

    return ethicalityLevelsList;
  }
}

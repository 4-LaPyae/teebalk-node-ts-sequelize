// import Logger from '@freewilltokyo/logger';

import { IHighlightPointRepository } from '../../dal';
import { IHighlightPointModel } from '../../database';

export interface HighlightPointServiceOptions {
  highlightPointRepository: IHighlightPointRepository;
}

export class HighlightPointService {
  private services: HighlightPointServiceOptions;

  constructor(services: HighlightPointServiceOptions) {
    this.services = services;
  }

  async getAllList(): Promise<IHighlightPointModel[]> {
    const highlightPointsList = await this.services.highlightPointRepository.findAll({
      where: { deletedAt: null },
      attributes: ['id', 'name_id', 'value', 'background_image', 'icon', 'type']
    });

    return highlightPointsList;
  }
}

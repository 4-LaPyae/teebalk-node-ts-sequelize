import { Op } from 'sequelize';

import { HighlightPointDbModel, IHighlightPointModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export interface IHighlightPointRepository extends IRepository<IHighlightPointModel> {
  getAllByTypeAndIds(ids: number[], type: string): Promise<IHighlightPointModel[]>;
}

export class HighlightPointRepository extends BaseRepository<IHighlightPointModel> implements IHighlightPointRepository {
  constructor() {
    super(HighlightPointDbModel);
  }

  getAllByTypeAndIds(ids: number[], type: string): Promise<IHighlightPointModel[]> {
    return this.findAll({
      where: {
        [Op.and]: [
          {
            id: {
              [Op.in]: ids
            }
          },
          { type }
        ]
      }
    }) as any;
  }
}

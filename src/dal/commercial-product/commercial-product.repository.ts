import { FindOptions } from 'sequelize';

import { DEFAULT_TOP_PRODUCTS_LIST_LIMIT } from '../../constants';
import { PRODUCT_RELATED_MODELS } from '../../dal/product/constants';
import { CommercialProductDbModel, ProductDbModel, ProductStatusEnum } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

import { ICommercialProductDao } from './interfaces';

// const log = new Logger('DAL:ProductRepository');
const { contents, stories, images, producers, highlightPoints, category } = PRODUCT_RELATED_MODELS;

export interface ICommercialProductRepository extends IRepository<ICommercialProductDao> {
  getCommercialList(options?: FindOptions): Promise<any[]>;
}

export class CommercialProductRepository extends BaseRepository<ICommercialProductDao> implements ICommercialProductRepository {
  constructor() {
    super(CommercialProductDbModel);
  }

  getCommercialList(options?: FindOptions): Promise<any[]> {
    return this.findAll({
      limit: DEFAULT_TOP_PRODUCTS_LIST_LIMIT,
      offset: 0,
      where: { deletedAt: null },
      order: [['order', 'ASC']],
      ...options,
      include: [
        {
          model: ProductDbModel,
          as: 'product',
          where: {
            status: ProductStatusEnum.PUBLISHED
          },
          attributes: ['id', 'nameId', 'price', 'stock', 'status'],
          include: [stories, images, contents, producers, highlightPoints, category]
        }
      ]
    });
  }
}

import { col, FindOptions, fn } from 'sequelize';

import { DEFAULT_TOP_PRODUCTS_LIST_LIMIT, TopProductTypeEnum } from '../../constants';
import { ProductDbModel, ProductStatusEnum, TopProductV2DbModel } from '../../database';
import { BaseRepository, IRepository } from '../_base';
import { PRODUCT_RELATED_MODELS } from '../product/constants';
import { ITopProductDao } from '../top-product/interfaces';

// const log = new Logger('DAL:ProductRepository');
const { contents, stories, images, producers, highlightPoints, category } = PRODUCT_RELATED_MODELS;

export interface ITopProductV2Repository extends IRepository<ITopProductDao> {
  getTopList(type: TopProductTypeEnum, options?: FindOptions): Promise<any[]>;
}

export class TopProductV2Repository extends BaseRepository<ITopProductDao> implements ITopProductV2Repository {
  constructor() {
    super(TopProductV2DbModel);
  }

  getTopList(type: TopProductTypeEnum, options?: FindOptions): Promise<any[]> {
    return this.findAll({
      limit: DEFAULT_TOP_PRODUCTS_LIST_LIMIT,
      offset: 0,
      where: { type, deletedAt: null },
      order: [fn('isnull', col('order')), ['order', 'ASC'], ['id', 'ASC']],
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

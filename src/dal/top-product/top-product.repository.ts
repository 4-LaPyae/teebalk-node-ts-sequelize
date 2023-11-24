import { FindOptions } from 'sequelize';

import { DEFAULT_TOP_PRODUCTS_LIMIT } from '../../constants';
import { PRODUCT_RELATED_MODELS } from '../../dal/product/constants';
import { ProductDbModel, ProductStatusEnum, TopProductDbModel } from '../../database';
import { BaseRepository, IRepository } from '../_base';

import { ITopProductDao } from './interfaces';

// const log = new Logger('DAL:ProductRepository');
const { contents, stories, images, producers } = PRODUCT_RELATED_MODELS;

export interface ITopProductRepository extends IRepository<ITopProductDao> {
  getTopList(options?: FindOptions): Promise<any[]>;
}

export class TopProductRepository extends BaseRepository<ITopProductDao> implements ITopProductRepository {
  constructor() {
    super(TopProductDbModel);
  }

  getTopList(options?: FindOptions): Promise<any[]> {
    return this.findAll({
      limit: DEFAULT_TOP_PRODUCTS_LIMIT,
      offset: 0,
      ...options,
      include: [
        {
          model: ProductDbModel,
          as: 'product',
          where: {
            status: ProductStatusEnum.PUBLISHED
          },
          attributes: ['id', 'nameId', 'price', 'stock'],
          include: [stories, images, contents, producers]
        }
      ]
    });
  }
}

import { FindOptions } from 'sequelize';

import { CartDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

import { ICartDao } from './interfaces';

export interface ICartRepository extends IRepository<ICartDao> {
  turnOffUnavailableMessage(cartItemIds: number[]): any;
  getAllCartItemsList(findOptions?: FindOptions): Promise<ICartDao[]>;
}

export class CartRepository extends BaseRepository<ICartDao> implements ICartRepository {
  constructor() {
    super(CartDbModel);
  }

  turnOffUnavailableMessage(cartItemIds: number[]): Promise<any> {
    return this.update({ showUnavailableMessage: false }, { where: { id: cartItemIds } });
  }

  getAllCartItemsList(findOptions?: FindOptions): Promise<ICartDao[]> {
    return this.findAll({
      offset: 0,
      ...findOptions,
      order: [['createdAt', 'ASC']]
    }) as any;
  }
}

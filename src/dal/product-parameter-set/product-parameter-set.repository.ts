import { IncrementDecrementOptionsWithBy } from 'sequelize/types';

import { ProductParameterSetDbModel } from '../../database';
import { BaseRepository } from '../_base';

import { IProductParameterSetDao } from './interface';

export class ProductParameterSetRepository extends BaseRepository<IProductParameterSetDao> {
  constructor() {
    super(ProductParameterSetDbModel);
  }

  increasePurchasedNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IProductParameterSetDao>> {
    return this.increaseNumberValue(this.model.tableAttributes.purchasedNumber.fieldName, options);
  }

  decreaseStockNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IProductParameterSetDao>> {
    return this.decreaseNumberValue(this.model.tableAttributes.stock.fieldName, options);
  }

  decreaseShipLaterStockNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IProductParameterSetDao>> {
    return this.decreaseNumberValue(this.model.tableAttributes.shipLaterStock.fieldName, options);
  }
}

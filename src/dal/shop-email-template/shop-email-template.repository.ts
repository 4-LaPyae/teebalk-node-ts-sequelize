import { IShopEmailTemplateModel, ShopEmailTemplateDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IShopEmailTemplateRepository = IRepository<IShopEmailTemplateModel>;

export class ShopEmailTemplateRepository extends BaseRepository<IShopEmailTemplateModel> implements IShopEmailTemplateRepository {
  constructor() {
    super(ShopEmailTemplateDbModel);
  }
}

import { GiftSetProductDbModel, IGiftSetProductModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IGiftSetProductRepository = IRepository<IGiftSetProductModel>;

export class GiftSetProductRepository extends BaseRepository<IGiftSetProductModel> implements IGiftSetProductRepository {
  constructor() {
    super(GiftSetProductDbModel);
  }
}

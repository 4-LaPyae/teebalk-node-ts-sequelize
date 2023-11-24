import { IGiftSetProductContentModel, IGiftSetProductModel } from '../../database';
import { IProductDao } from '../product';

export interface IExtendedGiftSetProduct extends IGiftSetProductModel {
  content?: Partial<IGiftSetProductContentModel>;
  contents?: Partial<IGiftSetProductContentModel>[];
  product?: Partial<IProductDao>;
}

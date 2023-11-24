import { LockingTypeEnum } from './ordering-items.model';

export interface IProductInventoryValidation {
  productId: number;
  colorId?: number | null;
  customParameterId?: number | null;
  quantity: number;
  type: LockingTypeEnum;
}

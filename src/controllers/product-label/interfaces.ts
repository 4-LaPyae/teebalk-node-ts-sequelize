import { IMultiLanguageField } from '@freewilltokyo/freewill-be';

interface IProductLabel {
  id: number;
  typeId: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  name: IMultiLanguageField;
}

export interface IProductLabelResModel {
  id: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  labels: IProductLabel[];
  name: IMultiLanguageField;
}

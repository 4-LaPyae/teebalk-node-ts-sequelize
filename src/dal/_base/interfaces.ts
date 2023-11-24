import { BulkCreateOptions, CreateOptions, Transaction, UpdateOptions } from 'sequelize';
import { DestroyOptions, FindOptions, IncrementDecrementOptionsWithBy } from 'sequelize/types/lib/model';

export interface IRepository<T> {
  modelName: string;

  bulkCreate(dataSet: Partial<T>[], options?: BulkCreateOptions): Promise<any>;

  create(data: Partial<T>, options?: CreateOptions): Promise<T>;

  update(patchData: Partial<T>, options?: UpdateOptions): Promise<Partial<T>>;

  delete(findOptions?: FindOptions, destroyOptions?: DestroyOptions): Promise<any>;

  findOne(options?: FindOptions): Promise<T>;

  findOrCreate(options: { where: Partial<T>; defaults?: Partial<T>; transaction?: Transaction }): Promise<[T, boolean]>;

  getById(id: number, options?: FindOptions): Promise<T>;

  findAll(options?: FindOptions): Promise<T[]>;

  findAndCountAll(options?: FindOptions): Promise<{ rows: T[]; count: number }>;

  count(options?: FindOptions): Promise<number>;

  increaseNumberValue<K extends keyof T>(field: K, options?: IncrementDecrementOptionsWithBy): Promise<Partial<T>>;
}

export interface IFindAndCountResult<T> {
  count: number;
  rows: T[];
}

export interface IPaginationOptions {
  limit: number;
  offset: number;
}

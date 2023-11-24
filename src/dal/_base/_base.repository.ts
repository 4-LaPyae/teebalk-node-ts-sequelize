import Logger from '@freewilltokyo/logger';
import {
  BulkCreateOptions,
  CreateOptions,
  DestroyOptions,
  FindAndCountOptions,
  FindOptions,
  IncrementDecrementOptionsWithBy,
  Model,
  Transaction,
  UpdateOptions
} from 'sequelize';

import { DEFAULT_LIMIT } from '../../constants';
import { ApiError } from '../../errors';
import { LogMethodSignature } from '../../logger';

import { IFindAndCountResult, IRepository } from './interfaces';

const log = new Logger('DAL:Repository');

export abstract class BaseRepository<T> implements IRepository<T> {
  protected _model: Model;

  private _primaryKey: string;

  constructor(mainModel: any, primaryKey = 'id') {
    if (!mainModel) {
      throw new Error(`Parameter model should not be empty`);
    }
    this._model = mainModel;
    this._primaryKey = primaryKey;
  }

  get model() {
    return this._model as any;
  }

  get primaryKey() {
    return this._primaryKey;
  }

  get modelName() {
    return this.model.name;
  }

  escape(escapeString: string) {
    return this.model.sequelize.escape(escapeString);
  }

  async query(sql: string, options?: any) {
    try {
      const result = await this.model.sequelize.query(sql, options);
      return result?.length ? result[0] : null;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err?.message);
    }
  }

  async getById(id: number, options?: FindOptions) {
    try {
      const result = await this.findOne({ ...options, where: { [this.primaryKey]: id } });
      return result;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err?.message);
    }
  }

  async findOrCreate(options: { where: Partial<T>; defaults?: Partial<T>; transaction?: Transaction }): Promise<[T, boolean]> {
    try {
      const [found, created] = await this.model.findOrCreate(options);
      return [found.toJSON(), created] as any;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err?.message);
    }
  }

  count(options?: FindOptions): Promise<number> {
    try {
      return this.model.count(options);
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err?.message);
    }
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    try {
      if (options?.limit) {
        options.limit = +options.limit;
      }
      if (options?.offset) {
        options.offset = +options.offset;
      }
      const records = await this.model.findAll(options);
      return records.map((r: Model) => r.toJSON());
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err?.message);
    }
  }

  async findAndCountAll(options?: FindAndCountOptions): Promise<IFindAndCountResult<T>> {
    try {
      const result: { rows: any[]; count: number } = await this.model.findAndCountAll({
        ...options,
        limit: options?.limit ? +options.limit : DEFAULT_LIMIT,
        offset: options?.offset ? +options.offset : 0
      });
      result.rows = result.rows.map((r: Model) => r.toJSON());
      return result;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err?.message);
    }
  }

  async findOne(options?: FindOptions): Promise<T> {
    try {
      const result = await this.model.findOne(options);
      return result?.toJSON();
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err?.message);
    }
  }

  @LogMethodSignature(log)
  async create(data: Partial<T>, options?: CreateOptions): Promise<T> {
    try {
      const result = await this.model.create(data, { returning: true, ...options });
      return result?.toJSON();
    } catch (err) {
      log.error(err);
      throw new ApiError(500, err?.message, err?.name);
    }
  }

  async bulkCreate(dataSet: Partial<T>[], options?: BulkCreateOptions): Promise<any> {
    try {
      const result = await this.model.bulkCreate(dataSet, { returning: true, individualHooks: true, ...options });
      return result;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err?.message);
    }
  }

  async update(patchData: Partial<T>, options?: UpdateOptions): Promise<Partial<T>> {
    try {
      const result = await this.model.update(patchData, { returning: true, ...options });
      return result;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err?.message);
    }
  }

  async delete(findOptions?: FindOptions, destroyOptions?: DestroyOptions): Promise<any> {
    try {
      const result = await this.model.destroy({ individualHooks: true, ...findOptions, ...destroyOptions });
      return result;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err?.message);
    }
  }

  async increaseNumberValue<K extends keyof T>(field: K, options?: IncrementDecrementOptionsWithBy): Promise<Partial<T>> {
    try {
      const result = await this.model.increment(field, { returning: true, ...options });
      return result;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err?.message);
    }
  }

  async decreaseNumberValue<K extends keyof T>(field: K, options?: IncrementDecrementOptionsWithBy): Promise<Partial<T>> {
    try {
      const result = await this.model.decrement(field, { returning: true, ...options });
      return result;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err?.message);
    }
  }
}

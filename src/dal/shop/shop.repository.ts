// import Logger from '@freewilltokyo/logger';
import { FindOptions, Op } from 'sequelize';

import { IShopPaginationOptions } from '../../controllers/shop/interfaces';
import {
  IShopAddressModel,
  IShopModel,
  KeysArrayOf,
  ShopAddressDbModel,
  ShopContentDbModel,
  ShopDbModel,
  ShopImageDbModel,
  ShopStatusEnum
} from '../../database';
import { BaseRepository, IFindAndCountResult, IRepository } from '../_base';

import { IShopDao } from './interfaces';

// const log = new Logger('DAL:ShopRepository');

export interface IShopRepository extends IRepository<IShopDao> {
  getSimpleOneById(id: number, options?: FindOptions): Promise<IShopModel>;
  getSimpleOneByNameId(nameId: string, options?: FindOptions): Promise<IShopModel>;
  getPublicOneByNameId(nameId: string, options?: FindOptions): Promise<IShopDao>;
  getPublicSimpleOneByNameId(nameId: string, options?: FindOptions): Promise<IShopModel>;
  getPublicSimpleOneByUserIdAsync(userId: number, options?: FindOptions): Promise<IShopDao>;
  getList(paginationOptions: Partial<IShopPaginationOptions>, options?: FindOptions): Promise<IShopDao[]>;
  getListAndCountAll(paginationOptions: Partial<IShopPaginationOptions>, options?: FindOptions): Promise<IFindAndCountResult<IShopDao>>;
}

export class ShopRepository extends BaseRepository<IShopDao> implements IShopRepository {
  constructor() {
    super(ShopDbModel);
  }

  getById(id: number, options: FindOptions): Promise<IShopDao> {
    return super.getById(id, {
      ...options,
      include: [
        ...(options?.include || []),
        {
          as: 'contents',
          model: ShopContentDbModel,
          attributes: ['title', 'subTitle', 'description', 'policy', 'isOrigin', 'language']
        },
        {
          as: 'images',
          model: ShopImageDbModel,
          attributes: ['id', 'imagePath', 'imageDescription', 'isOrigin', 'language']
        }
      ]
    });
  }

  getSimpleOneById(id: number, options?: FindOptions): Promise<IShopModel> {
    return this.findOne({
      ...options,
      where: {
        [Op.and]: [options?.where || {}, { id }]
      }
    });
  }

  getSimpleOneByNameId(nameId: string, options?: FindOptions): Promise<IShopModel> {
    return this.findOne({
      ...options,
      where: {
        [Op.and]: [options?.where || {}, { nameId }]
      }
    });
  }

  getPublicOneByNameId(nameId: string, options?: FindOptions): Promise<IShopDao> {
    return this.findOne({
      ...options,
      where: {
        [Op.and]: [options?.where || {}, { nameId }, { status: ShopStatusEnum.PUBLISHED }]
      },
      include: [
        ...(options?.include || []),
        {
          as: 'addresses',
          model: ShopAddressDbModel,
          attributes: [
            'postalCode',
            'country',
            'countryCode',
            'state',
            'stateCode',
            'city',
            'addressLine1',
            'addressLine2',
            'locationCoordinate',
            'locationPlaceId',
            'isOrigin',
            'language'
          ] as KeysArrayOf<IShopAddressModel>
        },
        {
          as: 'contents',
          model: ShopContentDbModel,
          attributes: ['title', 'subTitle', 'description', 'policy', 'isOrigin', 'language']
        },
        {
          as: 'images',
          model: ShopImageDbModel,
          attributes: ['id', 'imagePath', 'imageDescription', 'isOrigin', 'language']
        }
      ]
    });
  }

  getPublicSimpleOneByNameId(nameId: string, options?: FindOptions): Promise<IShopModel> {
    return this.findOne({
      ...options,
      where: {
        [Op.and]: [options?.where || {}, { nameId }, { status: ShopStatusEnum.PUBLISHED }]
      }
    });
  }

  async getPublicSimpleOneByUserIdAsync(userId: number, options?: FindOptions): Promise<IShopDao> {
    const shop = await this.findOne({
      ...options,
      where: {
        [Op.and]: [options?.where || {}, { userId }]
      },
      include: [
        ...(options?.include || []),
        {
          as: 'contents',
          model: ShopContentDbModel,
          attributes: ['title', 'subTitle', 'description', 'policy', 'isOrigin', 'language']
        },
        {
          as: 'images',
          model: ShopImageDbModel,
          attributes: ['id', 'imagePath', 'imageDescription', 'isOrigin', 'language']
        }
      ]
    });

    return shop;
  }

  getList(paginationOptions: Partial<IShopPaginationOptions>, options?: FindOptions): Promise<IShopDao[]> {
    const { limit, pageNumber } = paginationOptions;
    const offset = pageNumber && limit && (pageNumber - 1) * limit;
    return this.findAll({
      limit,
      offset,
      ...options
    });
  }

  getListAndCountAll(paginationOptions: Partial<IShopPaginationOptions>, options?: FindOptions): Promise<IFindAndCountResult<IShopDao>> {
    const { limit, pageNumber } = paginationOptions;
    const offset = pageNumber && limit && (pageNumber - 1) * limit;
    return this.findAndCountAll({
      limit,
      offset,
      ...options
    });
  }
}

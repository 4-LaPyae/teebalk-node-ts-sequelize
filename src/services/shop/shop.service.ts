import { randomBytes } from 'crypto';

import { LogMethodSignature } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { FindOptions, OrderItem, Transaction } from 'sequelize';

import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER, LanguageEnum } from '../../constants';
import { IShippingFeeSettingsModel, IShopPaginationOptions, IShopsList, IUpdateShopModel } from '../../controllers/shop/interfaces';
import { IShopAddressRepository, IShopContentRepository, IShopDao, IShopImageRepository, IShopRepository } from '../../dal';
import { PRODUCT_RELATED_MODELS } from '../../dal/product/constants';
import {
  IProductContentModel,
  IProductImageModel,
  IShopAddressModel,
  IShopContentModel,
  IShopImageModel,
  IShopModel,
  KeysArrayOf,
  ProductDbModel,
  ProductStatusEnum,
  SalesMethodEnum,
  ShopContentDbModel,
  ShopImageDbModel,
  ShopRegionalShippingFeesDbModel,
  ShopStatusEnum
} from '../../database';
import { selectWithLanguage } from '../../helpers';

import { ShopShippingFeesService } from '..';

const { contents, images } = PRODUCT_RELATED_MODELS;

const log = new Logger('SRV:ShopService');

export interface ShopServiceOptions {
  shopRepository: IShopRepository;
  shopAddressRepository: IShopAddressRepository;
  shopContentRepository: IShopContentRepository;
  shopImageRepository: IShopImageRepository;
  shopShippingFeesService: ShopShippingFeesService;
}
export interface IShop extends IShopDao {
  content: IShopContentModel;
}

export class ShopService {
  private readonly DEFAULT_NAME_ID_LENGTH: number = 30;
  private services: ShopServiceOptions;

  constructor(services: ShopServiceOptions) {
    this.services = services;
  }

  generateNameId(length: number = this.DEFAULT_NAME_ID_LENGTH): string {
    return randomBytes(length + 2)
      .toString('base64')
      .replace(/\W/g, '')
      .substring(0, length);
  }

  @LogMethodSignature(log)
  async getPublishedList(options: Partial<IShopPaginationOptions>, findOptions?: FindOptions): Promise<IShopsList> {
    const { language } = options || {};
    const findOptionsExtended = {
      ...findOptions,
      where: {
        ...findOptions?.where,
        status: ShopStatusEnum.PUBLISHED
      },
      include: [
        ...(findOptions?.include || []),
        {
          as: 'contents',
          model: ShopContentDbModel,
          separate: true,
          attributes: ['title', 'subTitle', 'description', 'policy', 'isOrigin', 'language']
        },
        {
          as: 'images',
          model: ShopImageDbModel,
          separate: true,
          attributes: ['id', 'imagePath', 'imageDescription', 'isOrigin', 'language']
        },
        {
          as: 'products',
          model: ProductDbModel,
          separate: true,
          required: true,
          where: { status: ProductStatusEnum.PUBLISHED, salesMethod: SalesMethodEnum.ONLINE },
          include: [contents, images]
        }
      ],
      order: [['publishedAt', 'DESC'], ['updatedAt', 'DESC'], ...((findOptions?.order as OrderItem[]) || [])]
    } as FindOptions;

    const shops = await this.services.shopRepository.getListAndCountAll(options, findOptionsExtended);

    return {
      count: shops.count,
      rows: shops.rows.map(shop => {
        const shopContent: IShopContentModel = selectWithLanguage(shop.contents, language, false);
        const products = shop.products?.map(product => {
          const productContent: IProductContentModel = selectWithLanguage(product?.contents, language, false);
          const productImages: IProductImageModel[] = selectWithLanguage(product?.images, language, true);
          const productResult = {
            ...product,
            content: productContent,
            images: productImages
          };
          delete productResult.contents;
          return productResult;
        });
        const shopResult = {
          ...shop,
          content: shopContent,
          products,
          totalPublishedProducts: products?.length || 0
        } as IShopDao;
        delete shopResult.contents;
        return shopResult;
      })
    };
  }

  async getRandomPublishedList(options: Partial<IShopPaginationOptions>, findOptions?: FindOptions): Promise<IShopsList> {
    const { limit = DEFAULT_LIMIT, language } = options || {};

    const ids = await this.getRandomPublishedShopIds(limit);

    const result = await this.getPublishedList(
      { limit, pageNumber: DEFAULT_PAGE_NUMBER, language },
      {
        ...findOptions,
        where: {
          ...findOptions?.where,
          id: ids as any
        }
      }
    );

    const re_sorted_result = {
      ...result,
      rows: ids.map(id => result.rows.find(row => row.id === id)).filter(row => row !== undefined) as IShopDao[]
    };

    return re_sorted_result;
  }

  async getRandomPublishedShopIds(limit: number): Promise<number[]> {
    const shops = await this.services.shopRepository.getList(
      {},
      {
        where: { status: ShopStatusEnum.PUBLISHED },
        attributes: ['id'],
        include: [
          {
            as: 'products',
            model: ProductDbModel,
            required: true,
            attributes: ['id'],
            where: { status: ProductStatusEnum.PUBLISHED, salesMethod: SalesMethodEnum.ONLINE }
          }
        ]
      }
    );

    const shopsWithMultipleOnlineProducts = shops.filter(shop => (shop.products?.length || 0) > 1);
    // log.debug('[getRandomPublishedShopIds] shopsWithMultipleOnlineProducts: ', shopsWithMultipleOnlineProducts);

    let randomIds: number[] = [];

    if (shopsWithMultipleOnlineProducts.length === 0) {
      return randomIds;
    }

    const setDistinctIds = new Set<number>();

    if (shopsWithMultipleOnlineProducts.length <= limit) {
      while (setDistinctIds.size < shopsWithMultipleOnlineProducts.length) {
        setDistinctIds.add(shopsWithMultipleOnlineProducts[Math.floor(Math.random() * shopsWithMultipleOnlineProducts.length)].id);
      }
    } else {
      while (setDistinctIds.size < limit) {
        setDistinctIds.add(shopsWithMultipleOnlineProducts[Math.floor(Math.random() * shopsWithMultipleOnlineProducts.length)].id);
      }
    }

    randomIds = [...setDistinctIds];

    return randomIds;
  }

  async getDefaultShopByUserIdAsync(userId: number): Promise<IShopDao> {
    const shop = await this.services.shopRepository.getPublicSimpleOneByUserIdAsync(userId);
    return shop;
  }

  async updateShippingFeeSettings(nameId: string, updateObj: IShippingFeeSettingsModel, transaction?: Transaction): Promise<boolean> {
    await this.services.shopRepository.update(updateObj, {
      where: { nameId },
      transaction
    });

    return true;
  }

  async updateShopData(shopId: number, updateObject: IUpdateShopModel, transaction?: Transaction): Promise<boolean> {
    await this.services.shopRepository.update(updateObject, { where: { id: shopId }, transaction });

    await this.services.shopContentRepository.update(
      {
        title: updateObject.title,
        subTitle: updateObject.subTitle,
        description: updateObject.description,
        policy: updateObject.policy,
        language: updateObject.language,
        isOrigin: true
      },
      {
        where: { shopId },
        transaction
      }
    );

    await this.services.shopImageRepository.updateImagesByShopId(shopId, updateObject.images, transaction);

    await this.services.shopAddressRepository.updateByShopId(shopId, updateObject.address, updateObject.language, transaction);

    return true;
  }

  async getShopByNameId(nameId: string, transaction?: Transaction): Promise<IShopDao> {
    const result = await this.services.shopRepository.findOne({
      where: { nameId },
      transaction
    });
    return result;
  }

  @LogMethodSignature(log)
  getShop(findOptions: FindOptions): Promise<IShopDao> {
    return this.services.shopRepository.findOne(findOptions);
  }

  async getShopDao(findOptions: FindOptions, language?: LanguageEnum): Promise<IShopDao> {
    const shop = await this.getShop(findOptions);
    if (!shop) {
      return shop;
    }

    const address: IShopAddressModel = selectWithLanguage(shop?.addresses, language, false);
    const shopContent: IShopContentModel = selectWithLanguage(shop?.contents, language, false);
    const shopImage: IShopImageModel = selectWithLanguage(shop?.images, language, false);
    const products = shop?.products?.map(product => {
      const productContent: IProductContentModel = selectWithLanguage(product?.contents, language, false);
      const productImages: IProductImageModel[] = selectWithLanguage(product?.images, language, true);
      const productResult = {
        ...product,
        content: productContent,
        images: productImages
      };
      delete productResult.contents;
      return productResult;
    });

    const shopResult = {
      ...shop,
      address,
      content: shopContent,
      image: shopImage,
      products,
      totalPublishedProducts: products?.length || 0
    } as IShopDao;
    delete shopResult.addresses;
    delete shopResult.contents;
    delete shopResult.images;

    return shopResult;
  }

  async getSettings(shopId: number): Promise<IShopDao> {
    const shopDao = await this.getShop({
      where: { id: shopId },
      include: [
        {
          as: 'regionalShippingFees',
          model: ShopRegionalShippingFeesDbModel,
          separate: true,
          attributes: ['id', 'prefectureCode', 'shippingFee'],
          where: {
            quantityRangeId: null
          }
        }
      ],
      attributes: [
        'minAmountFreeShippingDomestic',
        'minAmountFreeShippingOverseas',
        'isShippingFeesEnabled',
        'isFreeShipment',
        'shippingFee',
        'allowInternationalOrders',
        'overseasShippingFee'
      ] as KeysArrayOf<IShopModel>
    });

    const shippingFees = await this.services.shopShippingFeesService.getByShopId(shopId);

    return { ...shopDao, shippingFees };
  }
}

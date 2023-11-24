import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER, LanguageEnum } from '../../constants';
import { IShopDao } from '../../dal';
import {
  IShopAddressModel,
  IShopContentModel,
  IShopModel,
  ProductStatusEnum,
  SalesMethodEnum,
  ShopRegionalShippingFeesDbModel,
  ShopStatusEnum,
  Transactional
} from '../../database';
import { ApiError } from '../../errors';
import { selectWithLanguage } from '../../helpers';
import { LogMethodSignature } from '../../logger';
import { BaseController } from '../_base/base.controller';
import { IProductsList, IProductsListSearch, ISearchQuery } from '../product/interfaces';

import {
  ICreateShopModel,
  ICreateShopSettingsModel,
  IShippingFeeSettingsModel,
  IShopControllerServices,
  IShopPaginationOptions,
  IUpdateShopModel,
  IUpdateShopSettingsModel
} from './interfaces';

const log = new Logger('CTR:ShopController');

export class ShopController extends BaseController<IShopControllerServices> {
  @LogMethodSignature(log)
  getPublishedList(options: IShopPaginationOptions) {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER, language } = options || {};
    return this.services.shopService.getPublishedList({ limit, pageNumber, language });
  }

  @LogMethodSignature(log)
  getRandomPublishedList(options: IShopPaginationOptions) {
    const { limit = DEFAULT_LIMIT, language } = options || {};
    return this.services.shopService.getRandomPublishedList({ limit, language });
  }

  @LogMethodSignature(log)
  async getOneByNameId(nameId: string, options?: { language?: LanguageEnum }) {
    if (!nameId) {
      throw new Error('Parameter "shopNameId" should not be empty');
    }

    const shop: IShopDao = await this.services.shopRepository.getPublicOneByNameId(nameId, {
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
      ]
    });
    if (!shop) {
      throw ApiError.notFound();
    }

    const shippingFees = await this.services.shopShippingFeesService.getByShopId(shop?.id);
    const address: IShopAddressModel = selectWithLanguage(shop?.addresses, options?.language, false);
    const content: IShopContentModel = selectWithLanguage(shop?.contents, options?.language, false);

    const result = {
      ...shop,
      shippingFees,
      address,
      content
    };
    delete result.addresses;
    delete result.contents;

    return result;
  }

  @LogMethodSignature(log)
  async getPublishedOnlineProductsByNameId(nameId: string, options?: IShopPaginationOptions) {
    if (!nameId) {
      throw new Error('Parameter "shopNameId" should not be empty');
    }

    const shop: IShopModel = await this.services.shopRepository.getPublicSimpleOneByNameId(nameId);
    if (!shop) {
      throw ApiError.notFound();
    }

    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER, language } = options || {};
    const products = await this.services.productService.getPublishedOnlineProductListByShopId(shop.id, { limit, pageNumber, language });

    return {
      ...shop,
      products
    };
  }

  async getPublishedInstoreProducts(shopId: number, isShopMaster = false) {
    const products = await this.services.productService.getPublishedInstoreProductsByShop(
      shopId,
      {
        attributes: ['id', 'userId', 'nameId', 'code', 'status', 'price', 'stock', 'shipLaterStock', 'hasParameters']
      },
      isShopMaster
    );

    return products;
  }

  getAllPublishedInstoreProducts(shopId: number, searchQuery: ISearchQuery, isShopMaster = false): Promise<IProductsListSearch> {
    return this.services.productService.getAllPublishedInstoreProductsByShopId(shopId, searchQuery, isShopMaster);
  }

  @LogMethodSignature(log)
  async getAllOnlineProducts(shopId: number, searchQuery: ISearchQuery): Promise<IProductsList> {
    if (!shopId) {
      throw ApiError.badRequest('Parameter "shopId" should not be empty');
    }

    const products = await this.services.productService.getAllProducts(shopId, SalesMethodEnum.ONLINE, searchQuery);
    return products;
  }

  @LogMethodSignature(log)
  @Transactional
  async create(userId: number, shop: ICreateShopModel, transaction?: Transaction) {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }
    if (!shop) {
      throw new Error('Parameter "shop" should not be empty');
    }

    shop.nameId = shop.nameId || this.services.shopService.generateNameId();

    const createdShop = await this.services.shopRepository.create(
      {
        ...shop,
        userId
      },
      { transaction }
    );

    await this.services.shopContentRepository.create(
      {
        ...shop,
        shopId: createdShop.id,
        isOrigin: true
      },
      { transaction }
    );

    await this.services.shopImageRepository.bulkCreate(
      shop.images.map(item => {
        return {
          shopId: createdShop.id,
          imagePath: item.imagePath,
          imageDescription: item.imageDescription,
          language: shop.language,
          isOrigin: true
        };
      }),
      { transaction }
    );

    return createdShop;
  }

  @LogMethodSignature(log)
  @Transactional
  async updateShippingFeesSetting(userId: number, nameId: string, shippingFeeSettings: IShippingFeeSettingsModel) {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }
    if (!nameId) {
      throw new Error('Parameter "nameId" should not be empty');
    }

    const result = await this.services.shopService.updateShippingFeeSettings(nameId, shippingFeeSettings);

    return result;
  }

  @LogMethodSignature(log)
  @Transactional
  async deleteShippingFeesSetting(nameId: string) {
    if (!nameId) {
      throw new Error('Parameter "nameId" should not be empty');
    }

    const result = await this.services.shopService.updateShippingFeeSettings(nameId, {
      minAmountFreeShippingDomestic: null,
      minAmountFreeShippingOverseas: null
    } as any);

    return result;
  }

  // @LogMethodSignature(log)
  // @Transactional
  // async delete(userId: number, shop: IShopModel, transaction?: Transaction) {
  //   if (!shop?.id) {
  //     throw new Error('Parameter "shop.id" should not be empty');
  //   }

  //   try {
  //     await this.services.shopRepository.delete({ where: { id: shop.id }, transaction });
  //   } catch (err) {
  //     log.error('Error while deleting shop`s image. Reason:', err.message);
  //   }

  //   return true;
  // }

  @LogMethodSignature(log)
  @Transactional
  async update(shop: IShopModel, updateObject: IUpdateShopModel, transaction?: Transaction) {
    if (!shop) {
      throw new Error('Parameter "shop" should not be empty');
    }
    if (!updateObject) {
      throw new Error('Parameter "updateObject" should not be empty');
    }

    const shopId = shop.id;

    await this.services.shopService.updateShopData(shopId, updateObject, transaction);

    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async publish(userId: number, shopId: number, transaction?: Transaction) {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }
    if (!shopId) {
      throw new Error('Parameter "shopId" should not be empty');
    }

    await this.services.shopRepository.update(
      { status: ShopStatusEnum.PUBLISHED, publishedAt: new Date() as any },
      { where: { id: shopId }, transaction }
    );

    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  getSettings(shopId: number): Promise<IShopDao> {
    return this.services.shopService.getSettings(shopId);
  }

  @LogMethodSignature(log)
  @Transactional
  async createSettings(shopId: number, settings: ICreateShopSettingsModel, transaction?: Transaction) {
    const updateSettings: any[] = [];

    updateSettings.push(
      this.services.shopRepository.update(
        {
          isShippingFeesEnabled: true,
          isFreeShipment: settings.isFreeShipment,
          shippingFee: settings.shippingFee,
          allowInternationalOrders: settings.allowInternationalOrders,
          overseasShippingFee: settings.overseasShippingFee
        },
        { where: { id: shopId }, transaction }
      )
    );

    if (settings.regionalShippingFees) {
      updateSettings.push(this.services.shopRegionalShippingFeesService.bulkCreate(shopId, settings.regionalShippingFees, transaction));
    }

    if (settings.shippingFees) {
      updateSettings.push(this.services.shopShippingFeesService.bulkCreate(shopId, settings.shippingFees, transaction));
    }

    if (settings.disableShopAllProductsShippingFeesSettings) {
      updateSettings.push(this.services.productService.disableProductsShippingFeesSettingsByShopId(shopId, transaction));
    }

    await Promise.all(updateSettings);

    return settings;
  }

  @LogMethodSignature(log)
  @Transactional
  async updateSettings(shopId: number, settings: IUpdateShopSettingsModel, transaction?: Transaction) {
    if (settings.disableShopAllProductsShippingFeesSettings && settings.enableFreeShippingForDefaultShippingProducts) {
      throw ApiError.badRequest(
        `disableShopAllProductsShippingFeesSettings and enableFreeShippingForDefaultShippingProducts cannot be true at the same time`
      );
    }

    const updateSettings: any[] = [];

    updateSettings.push(
      this.services.shopRepository.update(
        {
          isShippingFeesEnabled: settings.isShippingFeesEnabled,
          isFreeShipment: settings.isFreeShipment,
          shippingFee: settings.shippingFee,
          allowInternationalOrders: settings.allowInternationalOrders,
          overseasShippingFee: settings.overseasShippingFee
        },
        { where: { id: shopId }, transaction }
      )
    );

    if (settings.regionalShippingFees) {
      updateSettings.push(this.services.shopRegionalShippingFeesService.updateByShopId(shopId, settings.regionalShippingFees, transaction));
    }

    if (settings.shippingFees) {
      updateSettings.push(this.services.shopShippingFeesService.updateByShopId(shopId, settings.shippingFees, transaction));
    }

    if (settings.disableShopAllProductsShippingFeesSettings) {
      if (!settings.isShippingFeesEnabled) {
        throw ApiError.badRequest(`isShippingFeesEnabled must be true when disableShopAllProductsShippingFeesSettings is true`);
      }

      updateSettings.push(this.services.productService.disableProductsShippingFeesSettingsByShopId(shopId, transaction));
    }

    if (settings.enableFreeShippingForDefaultShippingProducts) {
      if (settings.isShippingFeesEnabled) {
        throw ApiError.badRequest(`isShippingFeesEnabled must be false when enableFreeShippingForDefaultShippingProducts is true`);
      }

      updateSettings.push(this.services.productService.enableFreeShippingForDefaultShippingProductsByShopId(shopId, transaction));
    }

    await Promise.all(updateSettings);

    return settings;
  }

  @LogMethodSignature(log)
  async checkAllPublishedOnlineProductsHasShippingFeeSettings(shopId: number): Promise<boolean> {
    return !(await this.services.productService.getOne({
      attributes: ['shopId', 'isShippingFeesEnabled', 'salesMethod', 'status'],
      where: {
        shopId,
        isShippingFeesEnabled: false,
        salesMethod: SalesMethodEnum.ONLINE,
        status: ProductStatusEnum.PUBLISHED
      }
    }));
  }
}

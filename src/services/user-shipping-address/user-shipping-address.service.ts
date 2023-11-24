import { Transaction } from 'sequelize';

import { LanguageEnum, RegionCountryCodeEnum } from '../../constants';
import { IUserShippingAddressRequestModel } from '../../controllers/user-shipping-address/interfaces';
import { IProductDao, IShopDao, IUserShippingAddressRepository } from '../../dal';
import { IProductShippingFeesModel, IShopShippingFeesModel, IUserShippingAddressModel } from '../../database';

export interface UserShippingAddressServiceOptions {
  userShippingAddressRepository: IUserShippingAddressRepository;
}

export interface IUserShippingAddressService {
  create(userId: number, shippingAddress: IUserShippingAddressRequestModel): Promise<IUserShippingAddressModel>;

  update(
    userId: number,
    shippingAddressId: number,
    shippingAddress: IUserShippingAddressRequestModel,
    transaction?: Transaction
  ): Promise<Partial<IUserShippingAddressModel>>;

  getListAddressByUserId(userId: number, options?: { language?: LanguageEnum }): Promise<IUserShippingAddressModel[]>;

  calculateShopShippingFee(
    shopDetail: IShopDao,
    shopShippingFees: IShopShippingFeesModel[],
    quantity: number,
    userShippingAddress?: IUserShippingAddressModel
  ): number;

  calculateProductShippingFee(
    productDetail: IProductDao,
    productShippingFees: IProductShippingFeesModel[],
    quantity: number,
    userShippingAddress?: IUserShippingAddressModel
  ): number;

  delete(shippingAddressId: number, transaction?: Transaction): Promise<boolean>;

  markDefaultAddressById(userId: number, shippingAddressId: number, transaction?: Transaction): Promise<boolean>;
}

export class UserShippingAddressService {
  private services: UserShippingAddressServiceOptions;

  constructor(services: UserShippingAddressServiceOptions) {
    this.services = services;
  }

  async create(userId: number, shippingAddress: IUserShippingAddressRequestModel): Promise<IUserShippingAddressModel> {
    const createdShippingAddress = await this.services.userShippingAddressRepository.create({
      userId,
      ...shippingAddress,
      country: shippingAddress.country || '',
      countryCode: shippingAddress.countryCode || RegionCountryCodeEnum.JAPAN, // Default country is Japan
      state: shippingAddress.state || '',
      stateCode: shippingAddress.stateCode || ''
    });

    return createdShippingAddress;
  }

  async update(
    userId: number,
    shippingAddressId: number,
    shippingAddress: IUserShippingAddressRequestModel,
    transaction?: Transaction
  ): Promise<Partial<IUserShippingAddressModel>> {
    const updatedResult = await this.services.userShippingAddressRepository.update(
      {
        userId,
        ...shippingAddress,
        country: shippingAddress.country || '',
        countryCode: shippingAddress.countryCode || RegionCountryCodeEnum.JAPAN, // Default country is Japan
        state: shippingAddress.state || ''
      },
      { where: { id: shippingAddressId }, transaction }
    );

    return updatedResult;
  }

  async getListAddressByUserId(userId: number, options?: { language?: LanguageEnum }): Promise<IUserShippingAddressModel[]> {
    const userShippingAddresses = await this.services.userShippingAddressRepository.getAllByUserId(userId);
    const lang = options?.language ? options?.language : LanguageEnum.ENGLISH;
    const results = userShippingAddresses?.filter(item => item.language === lang);

    return results.length > 0 ? results : userShippingAddresses || [];
  }

  calculateShopShippingFee(
    shopDetail: IShopDao,
    shopShippingFees: IShopShippingFeesModel[],
    quantity: number,
    userShippingAddress?: Partial<IUserShippingAddressModel>
  ): number {
    if (!userShippingAddress) {
      return 0;
    }

    if (userShippingAddress.countryCode === RegionCountryCodeEnum.JAPAN && shopDetail.isFreeShipment) {
      return 0;
    }

    const shopShippingFeeBasesOnQuantity = shopShippingFees?.find(
      shippingFee => quantity >= shippingFee.quantityFrom && quantity <= shippingFee.quantityTo
    );

    if (shopShippingFeeBasesOnQuantity) {
      return this.calculateShippingFee(
        userShippingAddress,
        shopShippingFeeBasesOnQuantity.shippingFee,
        shopShippingFeeBasesOnQuantity.overseasShippingFee,
        shopShippingFeeBasesOnQuantity.regionalShippingFees,
        shopDetail.allowInternationalOrders,
        1
      );
    }

    return this.calculateShippingFee(
      userShippingAddress,
      shopDetail.shippingFee,
      shopDetail.overseasShippingFee,
      shopDetail.regionalShippingFees,
      shopDetail.allowInternationalOrders,
      quantity > 0 ? 1 : 0 // fixed at 1.
    );
  }

  calculateProductShippingFee(
    productDetail: IProductDao,
    productShippingFees: IProductShippingFeesModel[],
    quantity: number,
    userShippingAddress?: IUserShippingAddressModel
  ): number {
    if (!userShippingAddress) {
      return 0;
    }

    if (userShippingAddress.countryCode === RegionCountryCodeEnum.JAPAN && productDetail.isFreeShipment) {
      return 0;
    }

    const productShippingFeeBasesOnQuantity = productShippingFees.find(
      shippingFee => quantity >= shippingFee.quantityFrom && quantity <= shippingFee.quantityTo
    );

    if (productShippingFeeBasesOnQuantity) {
      return this.calculateShippingFee(
        userShippingAddress,
        productShippingFeeBasesOnQuantity.shippingFee,
        productShippingFeeBasesOnQuantity.overseasShippingFee,
        productShippingFeeBasesOnQuantity.regionalShippingFees,
        productDetail.allowInternationalOrders,
        1
      );
    }

    return this.calculateShippingFee(
      userShippingAddress,
      productDetail.shippingFee,
      productDetail.overseasShippingFee,
      productDetail.regionalShippingFees,
      productDetail.allowInternationalOrders,
      quantity
    );
  }

  async delete(shippingAddressId: number, transaction?: Transaction): Promise<boolean> {
    await this.services.userShippingAddressRepository.delete({
      where: { id: shippingAddressId },
      transaction
    });

    return true;
  }

  async markDefaultAddressById(userId: number, shippingAddressId: number, transaction?: Transaction): Promise<boolean> {
    const existedDefaultAddress = await this.services.userShippingAddressRepository.findOne({
      where: {
        user_id: userId,
        default: true
      }
    });

    if (existedDefaultAddress) {
      if (existedDefaultAddress.id === shippingAddressId) {
        return true;
      }

      await this.services.userShippingAddressRepository.update(
        {
          default: false
        },
        { where: { user_id: userId, id: existedDefaultAddress.id }, transaction }
      );
    }

    await this.services.userShippingAddressRepository.update(
      {
        default: true
      },
      { where: { user_id: userId, id: shippingAddressId }, transaction }
    );

    return true;
  }

  private calculateShippingFee(
    userShippingAddress: Partial<IUserShippingAddressModel>,
    shippingFee: number | undefined,
    overseasShippingFee: number | undefined,
    regionalShippingFees: { prefectureCode: string; shippingFee?: number }[] | undefined,
    allowInternationalOrders: boolean | undefined,
    quantity: number
  ): number {
    if (userShippingAddress.countryCode === RegionCountryCodeEnum.JAPAN) {
      const domesticShippingFee = shippingFee || 0;

      const prefectureShippingFee = (regionalShippingFees || []).find(item => item.prefectureCode === userShippingAddress.stateCode);

      if (prefectureShippingFee) {
        if (prefectureShippingFee.shippingFee === 0) {
          return 0;
        }

        return (prefectureShippingFee.shippingFee || domesticShippingFee) * quantity;
      }
      return domesticShippingFee * quantity;
    } else if (allowInternationalOrders) {
      return (overseasShippingFee || 0) * quantity;
    }

    return 0;
  }
}

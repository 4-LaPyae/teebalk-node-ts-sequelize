import { Transaction } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { IShopAddressModel, ShopAddressDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export interface IShopAddressRepository extends IRepository<IShopAddressModel> {
  updateByShopId(shopId: number, patchData: Partial<IShopAddressModel>, language: LanguageEnum, transaction?: Transaction): Promise<void>;
}

export class ShopAddressRepository extends BaseRepository<IShopAddressModel> implements IShopAddressRepository {
  constructor() {
    super(ShopAddressDbModel);
  }

  /**
   * Update images for shop
   */
  async updateByShopId(
    shopId: number,
    patchData: Partial<IShopAddressModel>,
    language: LanguageEnum,
    transaction?: Transaction
  ): Promise<void> {
    if (!patchData) {
      return;
    }

    let shopAddressId: number;

    if (patchData.id) {
      shopAddressId = patchData.id;
    } else {
      const [address] = await this.findOrCreate({
        where: { shopId },
        defaults: {
          shopId,
          postalCode: '',
          state: '',
          language,
          isOrigin: true
        },
        transaction
      });

      shopAddressId = address.id;
    }

    await this.update(
      {
        postalCode: patchData.postalCode,
        country: patchData.country,
        countryCode: patchData.countryCode,
        state: patchData.state,
        stateCode: patchData.stateCode,
        city: patchData.city,
        addressLine1: patchData.addressLine1,
        addressLine2: patchData.addressLine2,
        locationCoordinate: patchData.locationCoordinate,
        locationPlaceId: patchData.locationPlaceId,
        language,
        isOrigin: true
      },
      {
        where: { id: shopAddressId, shopId },
        transaction
      }
    );
  }
}

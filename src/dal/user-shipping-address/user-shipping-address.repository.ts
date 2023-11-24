import { FindOptions, Op, Transaction } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { IUserShippingAddressModel, UserShippingAddressDbModel } from '../../database';
import { BaseRepository, IRepository } from '../_base';

export interface IUserShippingAddressRepository extends IRepository<IUserShippingAddressModel> {
  getAllByUserId(userId: number, options?: FindOptions): Promise<IUserShippingAddressModel[]>;

  createOrUpdate(options: {
    where: { userId: number; language: LanguageEnum };
    defaults: Partial<IUserShippingAddressModel>;
    transaction?: Transaction;
  }): Promise<[IUserShippingAddressModel, boolean]>;
}

export class UserShippingAddressRepository extends BaseRepository<IUserShippingAddressModel> implements IUserShippingAddressRepository {
  constructor() {
    super(UserShippingAddressDbModel);
  }

  getAllByUserId(userId: number, options?: FindOptions): Promise<IUserShippingAddressModel[]> {
    return this.findAll({
      ...options,
      attributes: [
        'id',
        'userId',
        'name',
        'phone',
        'postalCode',
        'country',
        'countryCode',
        'state',
        'stateCode',
        'city',
        'addressLine1',
        'addressLine2',
        'emailAddress',
        'language',
        'default'
      ],
      where: {
        [Op.and]: [options?.where || {}, { userId }]
      },
      order: [
        ['default', 'DESC'],
        ['updatedAt', 'DESC']
      ]
    });
  }

  async createOrUpdate(options: {
    where: { userId: number; language: LanguageEnum };
    defaults: Partial<IUserShippingAddressModel>;
    transaction?: Transaction;
  }): Promise<[IUserShippingAddressModel, boolean]> {
    const [userShippingAddress, created] = await this.findOrCreate(options);
    if (!created) {
      await this.update(options.defaults, { where: { id: userShippingAddress.id }, transaction: options.transaction });
    }
    return [userShippingAddress, created];
  }
}

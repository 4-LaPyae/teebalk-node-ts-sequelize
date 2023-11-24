import { FindAndCountOptions, FindOptions, Op, WhereOptions } from 'sequelize';

import { IUserModel, ShopDbModel, UserDbModel, UserStripeDbModel } from '../../database';
import { BaseRepository, IFindAndCountResult, IRepository } from '../_base';

export interface IUserModelDao extends IUserModel {
  followers: number;
  followings: number;
}

export interface IUserRepository extends IRepository<IUserModel> {
  getProfileByParams(params: Partial<IUserModel>, includeStripe?: boolean): Promise<IUserModelDao>;

  getOneById(id: number, options?: FindOptions): Promise<Partial<IUserModel>>;

  findByExternaIds(externalIds: number[], options?: FindAndCountOptions): Promise<IFindAndCountResult<IUserModel>>;
}

export class UserRepository extends BaseRepository<IUserModel> implements IUserRepository {
  constructor() {
    super(UserDbModel);
  }

  findByExternaIds(externalIds: number[], options?: FindAndCountOptions) {
    return this.findAndCountAll({
      ...options,
      where: {
        externalId: { [Op.in]: [...new Set(externalIds)] }
      }
    });
  }

  getOneById(id: number, options?: FindOptions) {
    return this.findOne({
      ...options,
      where: { id }
    });
  }

  getProfileByParams(params: Partial<IUserModel>, includeStripe = false): Promise<IUserModelDao> {
    const options: FindOptions = {
      where: params as WhereOptions,
      include: [
        {
          as: 'shops',
          model: ShopDbModel,
          attributes: ['id', 'nameId', 'isFeatured', 'status', 'publishedAt', 'createdAt']
        }
      ],
      order: [
        [
          {
            as: 'shops',
            model: ShopDbModel
          },
          'publishedAt',
          'ASC'
        ]
      ]
    };

    if (includeStripe) {
      (options.include as any).push({
        model: UserStripeDbModel,
        as: 'stripe',
        attributes: ['status', 'accountId']
      });
    }

    return this.findOne(options) as any;
  }
}

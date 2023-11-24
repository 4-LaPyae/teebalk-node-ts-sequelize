// import Logger from '@freewilltokyo/logger';
import { DEFAULT_LIMIT, ISSOClient, ISSOUser, IVibesUser, VibesClient } from '@freewilltokyo/freewill-be';
import { FindOptions } from 'sequelize';

import { IShopRepository, IUserRepository } from '../../dal';
import { IShopModel, IUserModel, ShopDbModel, UserRoleEnum, UserStripeDbModel } from '../../database';
import { IUser } from '../auth';

// const log = new Logger('SRV:UserService');

export interface UserServiceOptions {
  vibesClient: VibesClient;
  ssoClient: ISSOClient;
  userRepository: IUserRepository;
  shopRepository: IShopRepository;
}

export interface IUserService {
  getLocalOOne(userId: number, tellsUserAttributes?: Array<keyof IUserModel>, otherFindOptions?: FindOptions): Promise<IUser>;

  // eslint-disable-next-line @typescript-eslint/tslint/config, prettier/prettier
  getLocalOOneByUserExternalId(externalId: number, tellsUserAttributes?: Array<keyof IUserModel>, otherFindOptions?: FindOptions): Promise<IUser>;

  getLocalList(userId: number[], tellsUserAttributes?: Array<keyof IUserModel>, otherFindOptions?: FindOptions): Promise<IUser[]>;

  // eslint-disable-next-line @typescript-eslint/tslint/config, prettier/prettier
  getLocalListByUserExternalId(externalId: number[], tellsUserAttributes?: Array<keyof IUserModel>, otherFindOptions?: FindOptions): Promise<IUser[]>;

  getSSOOne(externalId: number, ssoUserAttributes?: Array<keyof ISSOUser>): Promise<ISSOUser>;

  getSSOList(externalIds: number[], ssoUserAttributes?: Array<keyof ISSOUser>): Promise<ISSOUser[]>;

  getCombinedOne(userId: number, ssoUserAttributes?: Array<keyof ISSOUser>, tellsUserAttributes?: Array<keyof IUserModel>): Promise<IUser>;

  // eslint-disable-next-line @typescript-eslint/tslint/config, prettier/prettier
  getCombinedOneByUserExternalId(externalId: number, ssoUserAttributes?: Array<keyof ISSOUser>, tellsUserAttributes?: Array<keyof IUserModel>): Promise<IUser>;

  // eslint-disable-next-line @typescript-eslint/tslint/config, prettier/prettier
  getCombinedList(userIds: number[], ssoUserAttributes?: Array<keyof ISSOUser>, tellsUserAttributes?: Array<keyof IUserModel>): Promise<Map<number, IUser>>;

  // eslint-disable-next-line @typescript-eslint/tslint/config, prettier/prettier
  getCombinedListByUserExternalIds(externalIds: number[], ssoUserAttributes?: Array<keyof ISSOUser>, tellsUserAttributes?: Array<keyof IUserModel>): Promise<Map<number, IUser>>;

  getFollowersByUserExternalId(externalId: number): Promise<IVibesUser[]>;

  getFollowingsByUserExternalId(externalId: number): Promise<IVibesUser[]>;

  isSellerAsync(userId: number): Promise<boolean>;

  search(searchText: string): Promise<ISSOUser[]>;
}

export class UserService {
  private services: UserServiceOptions;

  constructor(services: UserServiceOptions) {
    this.services = services;
  }

  async getLocalOOne(userId: number, tellsUserAttributes?: Array<keyof IUserModel>, otherFindOptions?: FindOptions): Promise<IUser> {
    return (await this.services.userRepository.findOne({
      ...otherFindOptions,
      where: { ...otherFindOptions?.where, id: userId },
      attributes: tellsUserAttributes
    })) as any;
  }

  async getLocalOOneByUserExternalId(
    externalId: number,
    tellsUserAttributes?: Array<keyof IUserModel>,
    otherFindOptions?: FindOptions
  ): Promise<IUser> {
    return (await this.services.userRepository.findOne({
      ...otherFindOptions,
      where: { ...otherFindOptions?.where, externalId },
      attributes: tellsUserAttributes
    })) as any;
  }

  async getLocalList(userId: number[], tellsUserAttributes?: Array<keyof IUserModel>, otherFindOptions?: FindOptions): Promise<IUser[]> {
    return (await this.services.userRepository.findAll({
      ...otherFindOptions,
      where: { ...otherFindOptions?.where, id: userId },
      attributes: tellsUserAttributes
    })) as any;
  }

  async getLocalListByUserExternalId(
    externalId: number[],
    tellsUserAttributes?: Array<keyof IUserModel>,
    otherFindOptions?: FindOptions
  ): Promise<IUser[]> {
    return (await this.services.userRepository.findAll({
      ...otherFindOptions,
      where: { ...otherFindOptions?.where, externalId },
      attributes: tellsUserAttributes
    })) as any;
  }

  getSSOOne(externalId: number, ssoUserAttributes?: Array<keyof ISSOUser>): Promise<ISSOUser> {
    return this.services.ssoClient.getUserInfoWithDeleted(externalId, ssoUserAttributes);
  }

  getSSOList(externalIds: number[], ssoUserAttributes?: Array<keyof ISSOUser>): Promise<ISSOUser[]> {
    return this.services.ssoClient.getUsersWithDeleted(externalIds, ssoUserAttributes);
  }

  async getCombinedOne(
    userId: number,
    ssoUserAttributes?: Array<keyof ISSOUser>,
    tellsUserAttributes?: Array<keyof IUserModel>
  ): Promise<IUser> {
    const localAttributes = tellsUserAttributes && tellsUserAttributes.concat(['id', 'externalId']);
    const localFindOptions = {
      include: [
        {
          model: UserStripeDbModel,
          as: 'stripe',
          attributes: ['status']
        }
      ]
    };

    const includedUserRole = !tellsUserAttributes || tellsUserAttributes.includes('role');
    if (includedUserRole) {
      localFindOptions.include = [
        ...localFindOptions.include,
        {
          as: 'shops',
          model: ShopDbModel,
          attributes: ['id']
        }
      ];
    }

    const localUser = await this.getLocalOOne(userId, localAttributes, localFindOptions);
    const ssoUser = await this.getSSOOne(localUser.externalId, ssoUserAttributes);

    const role = (includedUserRole && this.getUserRole(localUser)) || undefined;

    const user = {
      ...ssoUser,
      ...localUser,
      role
    } as any;

    delete user.shops;

    return user;
  }

  async getCombinedOneByUserExternalId(
    externalId: number,
    ssoUserAttributes?: Array<keyof ISSOUser>,
    tellsUserAttributes?: Array<keyof IUserModel>
  ): Promise<IUser> {
    const localAttributes = tellsUserAttributes && tellsUserAttributes.concat(['id', 'externalId']);
    const localFindOptions = {} as FindOptions;

    const includedUserRole = !tellsUserAttributes || tellsUserAttributes.includes('role');
    if (includedUserRole) {
      localFindOptions.include = [
        {
          as: 'shops',
          model: ShopDbModel,
          attributes: ['id']
        }
      ];
    }

    const [localUser, ssoUser] = await Promise.all([
      this.getLocalOOneByUserExternalId(externalId, localAttributes, localFindOptions),
      this.getSSOOne(externalId, ssoUserAttributes)
    ]);

    const role = (includedUserRole && this.getUserRole(localUser)) || undefined;

    const user = {
      ...ssoUser,
      ...localUser,
      role
    } as any;

    delete user.shops;

    return user;
  }

  async getCombinedList(
    userIds: number[],
    ssoUserAttributes?: Array<keyof ISSOUser>,
    tellsUserAttributes?: Array<keyof IUserModel>
  ): Promise<Map<number, IUser>> {
    const localAttributes = tellsUserAttributes && tellsUserAttributes.concat(['id', 'externalId']);
    const ssoAttributes = ssoUserAttributes && ssoUserAttributes.concat(['id']);
    const localFindOptions = {} as FindOptions;

    const includedUserRole = !tellsUserAttributes || tellsUserAttributes.includes('role');
    if (includedUserRole) {
      localFindOptions.include = [
        {
          as: 'shops',
          model: ShopDbModel,
          attributes: ['id']
        }
      ];
    }

    const localUsers = await this.getLocalList([...new Set(userIds)], localAttributes, localFindOptions);
    const ssoUsers = await this.getSSOList(localUsers.map(({ externalId }) => externalId) as number[], ssoAttributes);

    // map key = userId
    return localUsers.reduce((map: Map<number, any>, localUser: any) => {
      const ssoUser = ssoUsers.find(({ id }) => localUser.externalId === id);
      const role = (includedUserRole && this.getUserRole(localUser)) || undefined;

      const user = {
        ...ssoUser,
        ...localUser,
        role
      };

      delete user.shops;

      map.set(localUser.id, user);

      return map;
    }, new Map());
  }

  async getCombinedListByUserExternalIds(
    externalIds: number[],
    ssoUserAttributes?: Array<keyof ISSOUser>,
    tellsUserAttributes?: Array<keyof IUserModel>
  ): Promise<Map<number, IUser>> {
    const localAttributes = tellsUserAttributes && tellsUserAttributes.concat(['externalId']);
    const ssoAttributes = ssoUserAttributes && ssoUserAttributes.concat(['id']);
    const localFindOptions = {} as FindOptions;

    const includedUserRole = !tellsUserAttributes || tellsUserAttributes.includes('role');
    if (includedUserRole) {
      localFindOptions.include = [
        {
          as: 'shops',
          model: ShopDbModel,
          attributes: ['id']
        }
      ];
    }

    const [localUsers, ssoUsers] = await Promise.all([
      this.getLocalListByUserExternalId(externalIds, localAttributes, localFindOptions),
      this.getSSOList(externalIds, ssoAttributes)
    ]);

    // map key = externalId
    return localUsers.reduce((map: Map<number, any>, localUser: any) => {
      const ssoUser = ssoUsers.find(({ id }) => localUser.externalId === id);
      const role = (includedUserRole && this.getUserRole(localUser)) || undefined;

      const user = {
        ...ssoUser,
        ...localUser,
        role
      };

      delete user.shops;

      map.set(localUser.externalId, user);

      return map;
    }, new Map());
  }

  async isSellerAsync(userId: number): Promise<boolean> {
    const shop = await this.services.shopRepository.getPublicSimpleOneByUserIdAsync(userId);
    return !!shop;
  }

  async getFollowersByUserExternalId(externalId: number): Promise<IVibesUser[]> {
    const { id: vibesUserId } = await this.services.vibesClient.getUserByExternalId(externalId);

    if (!vibesUserId) {
      return [];
    }

    const result = await this.services.vibesClient.getFollowers(vibesUserId, {
      limit: DEFAULT_LIMIT,
      offset: 0
    });

    return result;
  }

  async getFollowingsByUserExternalId(externalId: number): Promise<IVibesUser[]> {
    const { id: vibesUserId } = await this.services.vibesClient.getUserByExternalId(externalId);

    if (!vibesUserId) {
      return [];
    }

    const result = await this.services.vibesClient.getFollowings(vibesUserId, {
      limit: DEFAULT_LIMIT,
      offset: 0
    });

    return result;
  }

  async search(searchText: string): Promise<ISSOUser[]> {
    return (await this.services.ssoClient.search(searchText)) as ISSOUser[];
  }

  private getUserRole(user: Partial<IUser> & { shops?: Partial<IShopModel>[] }): UserRoleEnum | undefined {
    if (user.role === UserRoleEnum.SHOP_MASTER) {
      return user.role;
    }

    if (user.shops?.length) {
      return UserRoleEnum.SELLER;
    }

    return user.role;
  }
}

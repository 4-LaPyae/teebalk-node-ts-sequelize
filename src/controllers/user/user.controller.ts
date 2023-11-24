import { IFullUser, ISpinClient, ISSOClient, LogMethodFail, VibesClient } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';

import { LanguageEnum } from '../../constants';
import { IPaginationOptions, IUserRepository, IUserShippingAddressRepository, IUserStripeRepository } from '../../dal';
import { IUserModel, KeysArrayOf, Transactional, UserRoleEnum } from '../../database';
import { ApiError } from '../../errors';
import { selectWithLanguage } from '../../helpers';
import { LogMethodSignature } from '../../logger';
import { IUserService } from '../../services';
import { BaseController } from '../_base/base.controller';

import { IVibesUserDataWithCount } from './interfaces';

const log = new Logger('CTR:UserController');

interface IUserControllerServices {
  vibesClient: VibesClient;
  ssoClient: ISSOClient;
  spinClient: ISpinClient;
  userRepository: IUserRepository;
  userStripeRepository: IUserStripeRepository;
  userShippingAddressRepository: IUserShippingAddressRepository;
  userService: IUserService;
}

export class UserController extends BaseController<IUserControllerServices> {
  @LogMethodSignature(log)
  async getLocalUserDetails(externalId: number) {
    // TODO temp

    const [authUser, localUser] = await Promise.all([
      this.services.ssoClient.getUserInfo(externalId),
      this.services.userRepository.getProfileByParams({ externalId })
    ]);

    if (!localUser && !!authUser?.id) {
      const created = (await this.services.userRepository.create({ externalId: authUser.id })) as any;

      return {
        ...authUser,
        ...created
      };
    }

    return {
      ...authUser,
      ...localUser
    };

    // return this.services.userRepository.getProfileByParams({ id: userId });
  }

  @LogMethodSignature(log)
  getAllUsers(options?: IPaginationOptions) {
    return this.services.userRepository.findAndCountAll(options);
  }

  @LogMethodSignature(log)
  getUsersByParams(findObject: Partial<IUserModel>): Promise<IUserModel[]> {
    const attributes: KeysArrayOf<IUserModel> = ['id', 'externalId', 'role', 'createdAt', 'updatedAt'];
    const options = {
      where: findObject,
      attributes,
      order: [['id', 'DESC']]
    } as any;

    return this.services.userRepository.findAll(options);
  }

  @LogMethodSignature(log)
  async getRandomFeatured() {
    const options = {
      where: { isFeatured: true, role: UserRoleEnum.SELLER },
      attributes: ['id'],
      order: [['id', 'DESC']]
    } as any;

    let featuredUsers = await this.services.userRepository.findAll(options);
    if (!featuredUsers?.length) {
      delete options.where.isFeatured;
      featuredUsers = await this.services.userRepository.findAll(options);
    }
    const randomId = +featuredUsers[Math.floor(Math.random() * featuredUsers.length)].id;

    const found = await this.getOneByParams({ id: randomId });

    const userDetails = await this.services.ssoClient.getUserInfo(found.externalId);

    return {
      ...userDetails,
      ...found
    };
  }

  @LogMethodSignature(log)
  async search(search: string, options?: IPaginationOptions) {
    const foundSSOUsers = await this.services.ssoClient.search(search, options);

    if (!foundSSOUsers?.length) {
      return { count: 0, rows: [] };
    }

    const result = await this.services.userRepository.findByExternaIds(
      foundSSOUsers.map(({ id }) => id),
      options
    );

    if (!result?.count) {
      return result;
    }

    result.rows = result.rows.map(user => ({
      ...foundSSOUsers.find(({ id }) => user.externalId === id),
      ...user
    }));

    return result;
  }

  // TODO: replace with getUserProfileByExternalId when clients are ready
  @LogMethodSignature(log)
  async getUserProfileWithAuthByExternalId(externalId: number, userId?: number) {
    if (!externalId) {
      throw new Error('Parameter "externalId" should not be empty');
    }

    const [authUser, localUser] = await Promise.all([
      this.services.ssoClient.getUserInfo(externalId),
      this.services.userRepository.getProfileByParams({ externalId })
    ]);
    let collectedDonations;
    let spinUserDetails;
    let isFollowing;

    if (localUser) {
      localUser.role = await this.getUserRole(localUser);
      spinUserDetails = await this.getSpinUserDetails(externalId);
      isFollowing = null;
    } else {
      delete authUser.id;
    }

    return { ...authUser, ...localUser, collectedDonations, spin: spinUserDetails, externalId, isFollowing };
  }

  @LogMethodSignature(log)
  getUserProfileByExternalId(externalId: number) {
    if (!externalId) {
      throw new Error('Parameter "externalId" should not be empty');
    }

    return this.getOneByParams({ externalId });
  }

  @LogMethodSignature(log)
  async getUserProfile(id: number, userId?: number) {
    if (!id) {
      throw new Error('Parameter "id" should not be empty');
    }
    const profile: any = await this.getUserOwnProfile(id, false);
    const isFollowing = null;
    profile.vibes.isFollowing = isFollowing;
    return profile;
  }

  @LogMethodSignature(log)
  async getUserOwnProfile(id: number, includePaymentDatails = true): Promise<IFullUser> {
    if (!id) {
      throw new Error('Parameter "userId" should not be empty');
    }
    const [{ stripe, externalId, ...localUser }, userShippingAddress] = await Promise.all([
      this.getOneByParams({ id }, includePaymentDatails) as any,
      this.services.userShippingAddressRepository.getAllByUserId(id)
    ]);
    const [authUser, spin, vibes] = await Promise.all([
      this.getSSOUser(externalId),
      this.getSpinUser(externalId),
      this.services.vibesClient.getUserByExternalId(externalId)
    ]);

    localUser.isFollowing = null;
    localUser.role = await this.getUserRole(localUser);

    const defaultLanguage = LanguageEnum.JAPANESE;
    localUser.shippingAddress = selectWithLanguage(userShippingAddress, defaultLanguage, false);

    return { ...authUser, spin, vibes, tells: localUser, id: localUser.id, externalId, stripe } as any;
  }

  @LogMethodSignature(log)
  async getFollowersByUserId(id: number): Promise<IVibesUserDataWithCount> {
    if (!id) {
      throw new Error('Parameter "userId" should not be empty');
    }
    const { externalId } = await this.getOneByParams({ id }, false);

    const result = await this.services.userService.getFollowersByUserExternalId(externalId);

    return {
      count: result.length,
      data: result
    };
  }

  @LogMethodSignature(log)
  async getFollowingsByUserId(id: number): Promise<IVibesUserDataWithCount> {
    if (!id) {
      throw new Error('Parameter "userId" should not be empty');
    }
    const { externalId } = await this.getOneByParams({ id }, false);

    const result = await this.services.userService.getFollowingsByUserExternalId(externalId);

    return {
      count: result.length,
      data: result
    };
  }

  @LogMethodSignature(log)
  @Transactional
  updateUserProfile(accessToken: string, patchData: any) {
    // if (!userId) {
    //   throw new Error('Parameter "userId" should not be empty');
    // }

    if (!patchData) {
      throw new Error('Parameter "patchData" should not be empty');
    }

    // const { description, ...ssoUser } = patchData;
    // const [updatedLocalUser] = await Promise.all([
    // this.services.userRepository.update({ description }, { where: { id: userId }, transaction }),
    // this.services.ssoClient.updateUser(ssoUser, accessToken)
    // ]);
    // return updatedLocalUser;
    return this.services.ssoClient.updateUser(patchData, accessToken);
  }

  @LogMethodSignature(log)
  private async getOneByParams(params: Partial<IUserModel>, addStripe = false) {
    if (!params || !Object.keys(params).length) {
      throw new Error('Parameter "params" should not be empty');
    }

    const localUser = await this.services.userRepository.getProfileByParams(params, addStripe);

    if (!localUser) {
      throw ApiError.notFound('Invalid user id');
    }

    return localUser;
    // const collectedDonations = await this.services.sentencePaymentTransactionRepository.getCountsByUserId(localUser.id);
    // return { ...localUser, collectedDonations };

    // if (addSso) {
    //   const ssoUser = await this.services.ssoClient.getUserInfo(localUser.externalId);
    //
    //   result = { ...ssoUser, ...result };
    // }
  }

  @LogMethodSignature(log)
  private async getSpinUserDetails(externalId: number) {
    try {
      const { id: spinUserId } = await this.services.spinClient.getUserByExternalId(externalId);

      if (!spinUserId) {
        return {};
      }

      const [spinUserDetails, projects] = await Promise.all([
        this.services.spinClient.getUserInfo(spinUserId),
        this.services.spinClient.getProjectsByUserId(spinUserId)
      ]);
      return {
        id: spinUserDetails?.id,
        roles: spinUserDetails?.roles,
        introduction: spinUserDetails?.introduction,
        organization: spinUserDetails?.organization,
        projects
      };
    } catch (err) {
      log.error(err);
    }
    return {};
  }

  @LogMethodSignature(log)
  private async getUserRole(user: IUserModel): Promise<UserRoleEnum> {
    if (user.role === UserRoleEnum.SHOP_MASTER) {
      return user.role;
    }

    const isSeller = await this.services.userService.isSellerAsync(user.id);
    if (isSeller) {
      return UserRoleEnum.SELLER;
    }

    return user.role;
  }

  @LogMethodFail(log)
  private getSSOUser(externalId: number) {
    return this.services.ssoClient.getUserInfo(externalId);
  }

  @LogMethodFail(log, false)
  private getSpinUser(externalId: number) {
    return this.services.spinClient.getUserByExternalId(externalId);
  }
}

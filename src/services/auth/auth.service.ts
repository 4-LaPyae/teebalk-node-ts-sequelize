import { ApiError, ISSOClient, ISSOUser } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { IUserRepository } from '../../dal';
import { UserRoleEnum } from '../../database/models/user.model';

export interface AuthServiceOptions {
  ssoClient: ISSOClient;
  userRepository: IUserRepository;
}

const log = new Logger('SRV:AuthService');

export interface IUser extends ISSOUser {
  id: number;
  externalId: number;
  role: UserRoleEnum;
  isFeatured: boolean;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  accessToken?: string;
}

export class AuthService {
  private _services: AuthServiceOptions;

  constructor(services: AuthServiceOptions) {
    this._services = services;
  }

  async getUserByAccessToken(accessToken: string, transaction?: Transaction): Promise<IUser> {
    const authUser = await this._services.ssoClient.verifyAccessToken(accessToken);

    if (!authUser) {
      throw ApiError.unauthorized('Invalid access token');
    }

    const [localUser, created] = await this._services.userRepository.findOrCreate({ where: { externalId: +authUser.id }, transaction });

    if (created) {
      log.info(`Just created account for user ${authUser.name}`);
    }

    return { ...authUser, ...localUser, accessToken } as IUser;
  }

  async getUserByRefreshToken(accessToken: string): Promise<IUser> {
    const authUser = await this._services.ssoClient.verifyRefreshToken(accessToken);

    if (!authUser) {
      throw ApiError.unauthorized('Invalid access token');
    }

    const [localUser, created] = await this._services.userRepository.findOrCreate({
      where: { externalId: +authUser.id }
    });

    if (created) {
      log.info(`Just created account for user ${authUser.name}`);
    }

    return { ...authUser, ...localUser, accessToken } as IUser;
  }
}

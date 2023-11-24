import { EmailOptOutsRepository } from '../../dal';
import { IEmailOptoutsModel } from '../../database';

export interface EmailOptOutsServiceDependencies {
  emailOptOutsRepository: EmailOptOutsRepository;
}

export class UserEmailOptoutService {
  private dependencies: EmailOptOutsServiceDependencies;
  constructor(dependencies: EmailOptOutsServiceDependencies) {
    this.dependencies = dependencies;
  }

  getAllByUserId(user_id: number) {
    return this.dependencies.emailOptOutsRepository.findAll({
      attributes: ['email_notification'],
      where: { user_id }
    });
  }

  setUserEmailOptout(userId: number, emailNotification: string) {
    const createObj = { userId, emailNotification } as IEmailOptoutsModel;
    return this.dependencies.emailOptOutsRepository.findOrCreate({
      where: { ...createObj },
      defaults: createObj
    });
  }

  deleteUserEmailOptout(userId: number, emailNotification: string) {
    return this.dependencies.emailOptOutsRepository.delete({
      where: { userId, emailNotification }
    });
  }

  async getUsersByUserIds(userIds: number[], emailNotification: string) {
    const result = await this.dependencies.emailOptOutsRepository.findAll({
      where: {
        userId: userIds,
        emailNotification
      }
    });

    return result;
  }
}

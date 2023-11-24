import { IncrementDecrementOptionsWithBy, Op, Sequelize } from 'sequelize';

import { DataBaseTableNames, ExperienceSessionTicketDbModel, IExperienceSessionTicketModel } from '../../database';
import { BaseRepository, IRepository } from '../_base';
import { IExperienceSessionTicketDao } from '../experience-session-ticket/interface';

export interface IExperienceSessionTicketRepository extends IRepository<IExperienceSessionTicketDao> {
  setOutOfStockByExperienceId(experienceId: number): Promise<void>;

  increasePurchasedNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IExperienceSessionTicketDao>>;

  decreaseStockNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IExperienceSessionTicketDao>>;
}

export class ExperienceSessionTicketRepository extends BaseRepository<IExperienceSessionTicketModel> {
  constructor() {
    super(ExperienceSessionTicketDbModel);
  }

  setOutOfStockByExperienceId(experienceId: number): Promise<void> {
    /* eslint-disable @typescript-eslint/tslint/config */
    const sessionsQuery = `(
      SELECT id FROM ${DataBaseTableNames.EXPERIENCE_SESSIONS} s
      WHERE s.experience_id = ${experienceId}
      AND s.deleted_at is NULL
    )`;
    /* eslint-disable @typescript-eslint/tslint/config */
    return this.update(
      { quantity: 0 },
      {
        where: {
          sessionId: {
            [Op.in]: Sequelize.literal(sessionsQuery)
          }
        }
      }
    ) as any;
  }

  increasePurchasedNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IExperienceSessionTicketModel>> {
    return this.increaseNumberValue(this.model.tableAttributes.purchasedNumber.fieldName, options);
  }

  decreaseQuantityNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IExperienceSessionTicketModel>> {
    return this.decreaseNumberValue(this.model.tableAttributes.quantity.fieldName, options);
  }
}

import { Op, Sequelize } from 'sequelize';
import { QueryTypes } from 'sequelize';

import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER, ExperienceReservationQueryTypes } from '../../constants';
import { DataBaseTableNames, ExperienceOrderStatusEnum, ExperienceTicketDbModel } from '../../database';
import { ExperienceOrderDetailDbModel, IExperienceOrderDetailModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

import { EXPERIENCE_ORDER_DETAIL_RELATED_MODELS } from './constants';
import { IExperienceOrderDetailDao } from './interfaces';

const { includeReservations, includeTicket, includeExperience } = EXPERIENCE_ORDER_DETAIL_RELATED_MODELS;

export interface IExperienceOrderDetailRepository extends IRepository<IExperienceOrderDetailModel> {
  getDistinctOrderSessions(
    userId: number,
    queryType: ExperienceReservationQueryTypes,
    limit?: number,
    pageNumber?: number
  ): Promise<Partial<IExperienceOrderDetailModel>[]>;
  countAllSessionsByUser(userId: number, queryType: ExperienceReservationQueryTypes): Promise<number>;
  getOrderDetailsWithReservation(
    userId: number,
    sessionIds: number[],
    queryType: ExperienceReservationQueryTypes
  ): Promise<IExperienceOrderDetailDao[]>;
  getOrderDetailsByOrderId(orderId: number): Promise<IExperienceOrderDetailDao[]>;
}

export class ExperienceOrderDetailRepository extends BaseRepository<IExperienceOrderDetailModel>
  implements IExperienceOrderDetailRepository {
  constructor() {
    super(ExperienceOrderDetailDbModel);
  }

  async getDistinctOrderSessions(
    userId: number,
    queryType: ExperienceReservationQueryTypes,
    limit?: number,
    pageNumber?: number
  ): Promise<Partial<IExperienceOrderDetailModel>[]> {
    const offset = ((pageNumber || DEFAULT_PAGE_NUMBER) - 1) * (limit || DEFAULT_LIMIT);

    // eslint-disable-next-line @typescript-eslint/tslint/config
    const querySessionIds = `
    SELECT DISTINCT session_id as sessionId, start_time as startTime FROM ${DataBaseTableNames.EXPERIENCE_ORDER_DETAIL}
    WHERE (order_id IN (SELECT id FROM ${DataBaseTableNames.EXPERIENCE_ORDER}
       WHERE status='${ExperienceOrderStatusEnum.COMPLETED}' AND user_id = ${userId})
      OR
      id IN (SELECT order_detail_id FROM ${DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION}
        WHERE assigned_user_id = ${userId})
    )
    AND end_time ${this.getCompareDateTime(queryType)}
    ORDER BY start_time ${this.getStartTimeOrderBy(queryType)}
    LIMIT ${limit || DEFAULT_LIMIT}
    OFFSET ${offset};`;

    const result = await ExperienceOrderDetailDbModel.sequelize?.query(querySessionIds, { type: QueryTypes.SELECT });

    return result as Partial<IExperienceOrderDetailModel>[];
  }

  async countAllSessionsByUser(userId: number, queryType: ExperienceReservationQueryTypes): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/tslint/config
    const countQuery = `
    SELECT count(DISTINCT session_id, end_time) as count
    FROM ${DataBaseTableNames.EXPERIENCE_ORDER_DETAIL}
    WHERE (order_id IN (SELECT id FROM ${DataBaseTableNames.EXPERIENCE_ORDER}
      WHERE status='${ExperienceOrderStatusEnum.COMPLETED}' AND user_id =  ${userId})
      OR
      id IN (SELECT order_detail_id FROM ${DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION}
        WHERE assigned_user_id = ${userId})
    )
    AND end_time ${this.getCompareDateTime(queryType)}`;

    const countResult = await ExperienceOrderDetailDbModel.sequelize?.query(countQuery, { type: QueryTypes.SELECT });

    return countResult?.length ? (countResult[0] as any).count : 0;
  }

  async getOrderDetailsWithReservation(
    userId: number,
    sessionIds: number[],
    queryType: ExperienceReservationQueryTypes
  ): Promise<IExperienceOrderDetailDao[]> {
    // eslint-disable-next-line @typescript-eslint/tslint/config
    const filterOrderCompletedOrderAndUserId = `
    EXISTS (
      SELECT 1
      FROM ${DataBaseTableNames.EXPERIENCE_ORDER}
      WHERE ${DataBaseTableNames.EXPERIENCE_ORDER}.id = experienceOrderDetail.order_id
      AND ${DataBaseTableNames.EXPERIENCE_ORDER}.status = '${ExperienceOrderStatusEnum.COMPLETED}'
      AND user_id =  ${userId}
      )`;

    // eslint-disable-next-line @typescript-eslint/tslint/config
    const filterAsignedReservation = `
      EXISTS (
        SELECT 1
        FROM ${DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION}
        WHERE ${DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION}.order_detail_id = experienceOrderDetail.id
        AND ${DataBaseTableNames.EXPERIENCE_SESSION_TICKET_RESERVATION}.assigned_user_id = ${userId})`;

    const orderDetails = (await this.findAll({
      where: {
        [Op.and]: [
          { sessionId: sessionIds },
          { [Op.or]: [Sequelize.literal(filterOrderCompletedOrderAndUserId), Sequelize.literal(filterAsignedReservation)] }
        ]
      },
      include: [
        includeTicket,
        includeExperience,
        {
          ...includeReservations,
          where: {
            [Op.or]: [{ userId }, { assignedUserId: userId }]
          }
        }
      ],
      order: [['start_time', this.getStartTimeOrderBy(queryType)]]
    })) as IExperienceOrderDetailDao[];

    return orderDetails;
  }

  async getOrderDetailsByOrderId(orderId: number): Promise<IExperienceOrderDetailDao[]> {
    const result = await this.findAll({
      where: { orderId },
      include: [
        {
          ...includeTicket,
          include: [
            {
              model: ExperienceTicketDbModel,
              as: 'experienceTicket'
            }
          ]
        },
        includeExperience
      ]
    });

    return result as IExperienceOrderDetailDao[];
  }

  private getCompareDateTime(queryType: ExperienceReservationQueryTypes) {
    let compareTimeOperator = '';
    if (queryType === ExperienceReservationQueryTypes.UPCOMING) {
      compareTimeOperator = ' >= ';
    } else if (queryType === ExperienceReservationQueryTypes.COMPLETED) {
      compareTimeOperator = ' < ';
    }
    const dateTimeUTCNow = new Date().toISOString();
    return `${compareTimeOperator}  '${dateTimeUTCNow}'`;
  }

  private getStartTimeOrderBy(queryType: ExperienceReservationQueryTypes) {
    return queryType === ExperienceReservationQueryTypes.UPCOMING ? 'ASC' : 'DESC';
  }
}

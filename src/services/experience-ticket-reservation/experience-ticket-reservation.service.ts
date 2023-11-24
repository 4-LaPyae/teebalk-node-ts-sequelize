import sequelize, { FindOptions, Op, Transaction } from 'sequelize';

import {
  IExperienceOrderDetailDao,
  IExperienceOrderDetailRepository,
  IExperienceSessionTicketReservationLinkRepository,
  IExperienceSessionTicketReservationRepository
} from '../../dal';
import { EXPERIENCE_SESSION_TICKET_RESERVATION_TYPE_RELATED_MODELS } from '../../dal/experience-session-ticket-reservation-link/constants';
import {
  IExperienceOrderDetailModel,
  IExperienceSessionTicketReservationLinkModel,
  IExperienceSessionTicketReservationModel
} from '../../database';
import { generateNameId } from '../../helpers';

export interface ExperienceTicketReservationServiceOptions {
  experienceSessionTicketReservationRepository: IExperienceSessionTicketReservationRepository;
  experienceSessionTicketReservationLinkRepository: IExperienceSessionTicketReservationLinkRepository;
  experienceOrderDetailRepository: IExperienceOrderDetailRepository;
}

export interface IExperienceSessionTicketReservationLinkDao extends IExperienceSessionTicketReservationLinkModel {
  ticketReservation: IExperienceSessionTicketReservationDao;
}

export interface IExperienceSessionTicketReservationDao extends IExperienceSessionTicketReservationModel {
  orderDetail: IExperienceOrderDetailDao;
}

const { reservation } = EXPERIENCE_SESSION_TICKET_RESERVATION_TYPE_RELATED_MODELS;

export class ExperienceTicketReservationService {
  private services: ExperienceTicketReservationServiceOptions;

  constructor(services: ExperienceTicketReservationServiceOptions) {
    this.services = services;
  }

  async getOneSessionTicketReservationByTicketCode(ticketCode: string, sessionId: number) {
    const result = await this.services.experienceSessionTicketReservationRepository.getOneByTicketCode(ticketCode, sessionId);

    return result;
  }

  async generateTicket(userId: number, orderDetails: IExperienceOrderDetailModel[], transaction?: Transaction) {
    const tickets: Partial<IExperienceSessionTicketReservationModel>[] = [];

    orderDetails.forEach(orderDetail => {
      for (let i = 1; i <= orderDetail.quantity; i++) {
        tickets.push({
          userId,
          orderDetailId: orderDetail.id,
          ticketCode: generateNameId(8)
        });
      }
    });

    const generatedTickets: Partial<
      IExperienceSessionTicketReservationModel
    >[] = await this.services.experienceSessionTicketReservationRepository.bulkCreate(tickets, { transaction });

    const ticketLinks: Partial<IExperienceSessionTicketReservationLinkModel>[] = generatedTickets.map(ticket => ({
      reservationId: ticket.id,
      nameId: generateNameId(),
      available: true
    }));

    await this.services.experienceSessionTicketReservationLinkRepository.bulkCreate(ticketLinks, { transaction });

    return generatedTickets;
  }

  async findReservationLinks(options: FindOptions): Promise<IExperienceSessionTicketReservationLinkDao[]> {
    const data = await this.services.experienceSessionTicketReservationLinkRepository.findAll({
      ...options,
      where: {
        ...options.where
      },
      include: [reservation]
    });

    return data as IExperienceSessionTicketReservationLinkDao[];
  }

  async updateAssignedUserForTicketReservations(ticketReservationIds: number[], userId: number): Promise<boolean> {
    await this.services.experienceSessionTicketReservationRepository.update(
      { assignedUserId: userId, assignedAt: new Date().toUTCString() },
      { where: { id: { [Op.in]: ticketReservationIds } } }
    );

    return true;
  }

  async getOneByTicketCode(userId: number, ticketCode: string): Promise<IExperienceSessionTicketReservationModel> {
    const sessionTicketReservation = await this.services.experienceSessionTicketReservationRepository.findOne({
      where: {
        [Op.and]: [sequelize.where(sequelize.fn('BINARY', sequelize.col(`ticket_code`)), ticketCode), { userId }]
      },
      attributes: ['id']
    });
    return sessionTicketReservation;
  }

  async cancelSharedTicket(reservationId: number, transaction?: Transaction) {
    await Promise.all([
      this.services.experienceSessionTicketReservationRepository.update(
        {
          assignedUserId: null,
          assignedAt: null
        },
        {
          where: { id: reservationId },
          transaction
        }
      ),
      await this.services.experienceSessionTicketReservationLinkRepository.update(
        {
          available: false
        },
        {
          where: { reservationId },
          transaction
        }
      )
    ]);
    const newsessionTicketReservation = await this.services.experienceSessionTicketReservationLinkRepository.create(
      {
        reservationId,
        nameId: generateNameId(),
        available: true
      },
      { transaction }
    );

    return newsessionTicketReservation;
  }

  async checkinTicket(userId: number, answer: JSON, reservationIds: number[], transaction?: Transaction) {
    await this.services.experienceSessionTicketReservationRepository.update(
      {
        checkinedUserId: userId,
        checkinedAnswer: answer,
        checkinedAt: new Date().toUTCString()
      },
      {
        where: { id: reservationIds },
        transaction
      }
    );
  }

  async cancelCheckinedTicket(reservationIds: number[], transaction?: Transaction) {
    await this.services.experienceSessionTicketReservationRepository.update(
      {
        checkinedUserId: null,
        checkinedAnswer: null,
        checkinedAt: null
      },
      {
        where: { id: reservationIds },
        transaction
      }
    );
  }
}

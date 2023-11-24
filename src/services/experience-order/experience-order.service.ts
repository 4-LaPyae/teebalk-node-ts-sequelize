import json2csv, { Parser } from 'json2csv';
import _ from 'lodash';
import { FindOptions, Op, Sequelize, Transaction } from 'sequelize';

import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER, ExperienceReservationQueryTypes, LanguageEnum } from '../../constants';
import {
  IExperienceOrderDetailDao,
  IExperienceOrderDetailRepository,
  IExperienceOrderManagementRepository,
  IExperienceOrderRepository,
  ShopRepository
} from '../../dal';
import { EXPERIENCE_ORDER_RELATED_MODELS } from '../../dal/experience-order/constants';
import {
  DataBaseTableNames,
  ExperienceOrderStatusEnum,
  IExperienceOrderDetailModel,
  IExperienceOrderModel,
  UserGenderEnum
} from '../../database';
import { getAgeFromDateOfBirth, getLocaleDateTimeString, getPaginationMetaData } from '../../helpers';
import { IUser } from '../auth';
import { ExperienceCategoryService } from '../experience-category';
import { DATE_TIME_DOWNLOAD_FORMAT, EXPERIENCE_DOWNLOAD_TRANSLATIONS, GENDER_TRANSLATIONS } from '../experience/constants';
import { IUserService } from '../user';

import { EXPERIENCE_ORDER_EXPORT_TO_CSV_FIELDS } from './constants';
import {
  ICreateExperienceOrderModel,
  IExperienceOrderCSVDataExport,
  IExperienceOrderCSVExport,
  IExperienceOrderReservation,
  IExperienceOrderReservationPaging,
  ITicketReservation
} from './interfaces';

const { includeOrderDetails } = EXPERIENCE_ORDER_RELATED_MODELS;

export interface ExperienceOrderServiceOptions {
  experienceOrderRepository: IExperienceOrderRepository;
  experienceOrderDetailRepository: IExperienceOrderDetailRepository;
  experienceOrderManagementRepository: IExperienceOrderManagementRepository;
  userService: IUserService;
  experienceCategoryService: ExperienceCategoryService;
  shopRepository: ShopRepository;
}

export class ExperienceOrderService {
  private readonly DEFAULT_ID_LENGTH: number = 10;
  private services: ExperienceOrderServiceOptions;

  constructor(services: ExperienceOrderServiceOptions) {
    this.services = services;
  }

  generateCode(id: number, orderDate: string): string {
    const zeroPaddingID = (Array(this.DEFAULT_ID_LENGTH).join('0') + id).slice(-this.DEFAULT_ID_LENGTH);

    const d = new Date(orderDate);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day, zeroPaddingID].join('');
  }

  async createOrder(orderItem: Partial<ICreateExperienceOrderModel>, transaction?: Transaction): Promise<IExperienceOrderModel> {
    const createdOrderItem = await this.services.experienceOrderRepository.create(
      {
        ...orderItem,
        totalAmount: orderItem.amount,
        orderedAt: new Date() as any
      },
      { transaction }
    );

    if (orderItem.orderDetailItems) {
      for (const orderDetailItem of orderItem.orderDetailItems) {
        await this.services.experienceOrderDetailRepository.create(
          {
            ...orderDetailItem,
            orderId: createdOrderItem.id
          },
          { transaction }
        );
      }
    }

    return createdOrderItem;
  }

  getByPaymentIntentId(paymentIntentId: string, transaction?: Transaction): Promise<IExperienceOrderModel> {
    return this.services.experienceOrderRepository.getByPaymentIntentId(paymentIntentId, transaction);
  }

  getAllOrderDetailsByOrderId(orderId: number, transaction?: Transaction): Promise<IExperienceOrderDetailModel[]> {
    return this.services.experienceOrderDetailRepository.findAll({
      where: { orderId },
      transaction
    });
  }

  getAllOrderDetailsWithExperienceTicketByOrderId(orderId: number): Promise<IExperienceOrderDetailDao[]> {
    return this.services.experienceOrderDetailRepository.getOrderDetailsByOrderId(orderId);
  }

  getByOrderId(id: number, transaction?: Transaction): Promise<IExperienceOrderModel> {
    return this.services.experienceOrderRepository.findOne({
      where: { id },
      transaction
    });
  }

  getOneOrderDetailByParams(options: FindOptions, transaction?: Transaction): Promise<IExperienceOrderDetailModel> {
    return this.services.experienceOrderDetailRepository.findOne({
      ...options,
      where: {
        ...options.where
      },
      transaction
    });
  }

  async addPaymentIntentIdToOrder(id: number, paymentIntentId: string, transaction?: Transaction): Promise<boolean> {
    await this.services.experienceOrderRepository.update(
      {
        paymentIntentId
      },
      {
        where: { id },
        transaction
      }
    );

    return true;
  }

  async updateOrderById(id: number, updateData: Partial<IExperienceOrderModel>, transaction?: Transaction): Promise<boolean> {
    await this.services.experienceOrderRepository.update(updateData, {
      where: { id },
      transaction
    });

    return true;
  }

  async updateOrderByPaymentIntentId(
    id: number,
    paymentIntentId: string,
    updateData: Partial<IExperienceOrderModel>,
    transaction?: Transaction
  ): Promise<boolean> {
    await this.services.experienceOrderRepository.update(updateData, {
      where: {
        id,
        paymentIntentId
      },
      transaction
    });

    return true;
  }

  async getReservationsByOrderId(orderId: number, transaction?: Transaction): Promise<ITicketReservation[]> {
    const status = ExperienceOrderStatusEnum.COMPLETED;

    const orders = (await this.services.experienceOrderRepository.findAll({
      where: {
        [Op.and]: [{ id: orderId }, { status }]
      },
      attributes: [
        'id',
        'code',
        'amount',
        'totalAmount',
        'orderedAt',
        [
          // eslint-disable-next-line @typescript-eslint/tslint/config
          Sequelize.literal(`(
            SELECT ${DataBaseTableNames.EXPERIENCE_ORDER_DETAIL}.start_time
            FROM ${DataBaseTableNames.EXPERIENCE_ORDER_DETAIL}
            WHERE ${DataBaseTableNames.EXPERIENCE_ORDER_DETAIL}.order_id =  experienceOrder.id
            LIMIT 1
        )`),
          'startTime'
        ]
      ],
      include: includeOrderDetails,
      order: [[Sequelize.literal('startTime'), 'ASC']],
      transaction
    })) as any;

    const tickets = [];
    for (const order of orders) {
      for (const orderDetail of order.orderDetails) {
        tickets.push(
          ...orderDetail.reservations.map((reservation: any) => ({
            ...orderDetail.ticket,
            title: orderDetail.ticketName,
            price: orderDetail.price,
            totalPrice: orderDetail.totalPrice,
            priceWithTax: orderDetail.priceWithTax,
            ticketCode: reservation.ticketCode
          }))
        );

        delete orderDetail.reservations;
        delete orderDetail.experience;
        delete orderDetail.ticket;
      }
      delete order.orderDetails;
    }
    return tickets;
  }

  async getReservationsByUserId(
    userId: number,
    queryType: ExperienceReservationQueryTypes,
    limit?: number,
    pageNumber?: number
  ): Promise<IExperienceOrderReservationPaging> {
    const sessionIdResults = await this.services.experienceOrderDetailRepository.getDistinctOrderSessions(
      userId,
      queryType,
      limit,
      pageNumber
    );

    if (!sessionIdResults || sessionIdResults.length === 0) {
      return {
        count: 0,
        rows: [],
        metadata: getPaginationMetaData({
          limit: limit || DEFAULT_LIMIT,
          pageNumber: pageNumber || DEFAULT_PAGE_NUMBER,
          count: 0
        })
      };
    }

    const sessionIds = sessionIdResults.map(x => x.sessionId || 0);

    const [orderDetails, totalNumberOfSessions] = await Promise.all([
      this.services.experienceOrderDetailRepository.getOrderDetailsWithReservation(userId, sessionIds, queryType),
      this.services.experienceOrderDetailRepository.countAllSessionsByUser(userId, queryType)
    ]);

    const ssoUserList = await this.getSSOUserList(orderDetails);

    const data: IExperienceOrderReservation[] = [];
    const groupings = _.chain(orderDetails)
      .groupBy(x => x.sessionId)
      .map(x => x)
      .sortBy(group => orderDetails.indexOf(group[0]))
      .value();

    for (const orders of groupings) {
      const orderReservation = {} as IExperienceOrderReservation;

      const firstOrderDetail = orders[0];
      const experience = firstOrderDetail.experience;
      if (!experience || !experience.contents || experience.contents.length === 0) {
        continue;
      }

      const experienceContent = experience.contents[0];
      delete experience.contents;

      orderReservation.experience = {
        id: experience.id,
        nameId: experience.nameId,
        eventType: experience.eventType,
        quantity: experience.quantity,
        ethicalLevel: experience.ethicalLevel,
        transparencyLevel: experience.transparencyLevel,
        recycledMaterialPercent: experience.recycledMaterialPercent,
        materialNaturePercent: experience.materialNaturePercent,
        rarenessLevel: experience.rarenessLevel,
        rarenessTotalPoint: experience.rarenessTotalPoint,
        sdgs: experience.sdgs,
        categoryId: experience.categoryId,
        images: experience.images,
        title: experienceContent.title,
        description: experienceContent.description,
        storySummary: experienceContent.storySummary,
        story: experienceContent.story,
        requiredItems: experienceContent.requiredItems,
        warningItems: experienceContent.warningItems,
        cancelPolicy: experienceContent.cancelPolicy,
        locationCoordinate: experience.locationCoordinate,
        location: experience.location,
        locationPlaceId: experience.locationPlaceId,
        city: experience.city,
        country: experience.country,
        locationDescription: experience.locationDescription
      };

      orderReservation.session = {
        id: firstOrderDetail.sessionId,
        startTime: firstOrderDetail.startTime,
        defaultTimezone: firstOrderDetail.defaultTimezone,
        endTime: firstOrderDetail.endTime
      };
      const shop = experience.shop;
      orderReservation.shop = {
        ...shop,
        content: shop?.contents?.length ? shop.contents[0] : undefined,
        images: shop?.images
      };

      orderReservation.tickets = [];
      let totalAmount = 0;
      for (const orderDetail of orders) {
        totalAmount += orderDetail.totalPrice;
        orderReservation.tickets.push(
          ...orderDetail.reservations.map(reservation => ({
            ...orderDetail.ticket,
            id: reservation.id,
            price: orderDetail.price,
            totalPrice: orderDetail.totalPrice,
            priceWithTax: orderDetail.priceWithTax,
            ticketCode: reservation.ticketCode,
            linkNameId: reservation.links?.length > 0 ? reservation.links[0].nameId : undefined,
            owner: ssoUserList.find(ssoUser => ssoUser.id === reservation.userId),
            assigner: reservation.assignedUserId ? ssoUserList.find(ssoUser => ssoUser.id === reservation.assignedUserId) : undefined,
            checkinedUser: reservation.checkinedUserId ? ssoUserList.find(ssoUser => ssoUser.id === reservation.checkinedUserId) : undefined
          }))
        );
      }

      orderReservation.totalAmount = totalAmount;
      orderReservation.amount = orderReservation.totalAmount;
      data.push(orderReservation);
    }

    return {
      count: totalNumberOfSessions,
      rows: data,
      metadata: getPaginationMetaData({
        limit: limit || DEFAULT_LIMIT,
        pageNumber: pageNumber || DEFAULT_PAGE_NUMBER,
        count: totalNumberOfSessions
      })
    };
  }

  async getReservationsTotalByUserId(userId: number): Promise<{}> {
    const [upcoming, completed] = await Promise.all([
      this.services.experienceOrderDetailRepository.countAllSessionsByUser(userId, ExperienceReservationQueryTypes.UPCOMING),
      this.services.experienceOrderDetailRepository.countAllSessionsByUser(userId, ExperienceReservationQueryTypes.COMPLETED)
    ]);

    return { upcoming, completed };
  }

  async exportToCSV(shopId: number, options: { language: LanguageEnum; timeZone: string }) {
    const orders = (await this.services.experienceOrderRepository.getByShopId(shopId)) as IExperienceOrderCSVExport[];
    const result = await this.mappingExperienceOrderDataExport(orders, shopId, options);
    const parser = new Parser({
      fields: EXPERIENCE_ORDER_EXPORT_TO_CSV_FIELDS[options.language || LanguageEnum.JAPANESE],
      transforms: [json2csv.transforms.flatten({ arrays: true, objects: true })],
      withBOM: true
    });
    const csv = parser.parse(result);
    return csv;
  }

  getGenderTranslation(gender: UserGenderEnum | undefined, language: LanguageEnum): string | undefined {
    const genderTranslations = GENDER_TRANSLATIONS[language];
    if (gender || gender !== undefined) {
      return genderTranslations[gender];
    }
    return undefined;
  }

  private async mappingExperienceOrderDataExport(
    orders: IExperienceOrderCSVExport[],
    shopId: number,
    options: { language: LanguageEnum; timeZone: string }
  ) {
    const result = [];

    const assignedUserIds: number[] = [];

    orders.forEach(order => {
      order.orderDetails.forEach(orderDetail => {
        orderDetail.reservations.forEach(reservation => {
          if (reservation.assignedUserId) {
            assignedUserIds.push(reservation.assignedUserId);
          }
        });
      });
    });

    const userIds = [...new Set([...orders.map(order => order.userId), ...assignedUserIds])];

    const [categoriesMaps, userSSOs] = await Promise.all([
      this.getCategories(options),
      this.services.userService.getCombinedList(
        userIds,
        ['id', 'firstName', 'lastName', 'email', 'profession', 'gender', 'dateOfBirth'] as any,
        []
      )
    ]);

    const downloadTextTranslation = EXPERIENCE_DOWNLOAD_TRANSLATIONS[options.language];

    for (const order of orders) {
      let isFirstOrder = true;
      const transferAmount = order.paymentTransfers.length ? order.paymentTransfers[0].transferAmount : 0;

      for (const orderDetail of order.orderDetails) {
        for (const reservation of orderDetail.reservations) {
          const userId = reservation.assignedUserId || reservation.userId;
          const categoryId = orderDetail.experience.categoryId as number;
          const userSSO = userSSOs.get(userId);
          let row: IExperienceOrderCSVDataExport = {
            userId,
            userName: `${userSSO?.firstName} ${userSSO?.lastName}`,
            userProfession: userSSO?.profession,
            userEmail: userSSO?.email,
            userAge: getAgeFromDateOfBirth(userSSO?.dateOfBirth),
            userGender: this.getGenderTranslation(userSSO?.gender as UserGenderEnum, options.language),

            reservationId: reservation.ticketCode,
            ticketName: orderDetail.ticketName,
            ticketPrice: orderDetail.priceWithTax,
            ticketStatus: downloadTextTranslation.New,
            onlineTicket: orderDetail.online ? downloadTextTranslation.Yes : downloadTextTranslation.No,
            offlineTicket: orderDetail.offline ? downloadTextTranslation.Yes : downloadTextTranslation.No
          };

          if (isFirstOrder) {
            row = {
              ...row,
              orderId: order.id,
              orderedAt: getLocaleDateTimeString(order.orderedAt, DATE_TIME_DOWNLOAD_FORMAT, options.timeZone, LanguageEnum.ENGLISH),
              commission: order.totalAmount - transferAmount,
              totalAmountWithTax: order.totalAmount,
              payoutAmount: transferAmount,
              experienceNameId: orderDetail.experience.nameId,
              experienceTitle: (orderDetail.experience as any).contents[0].title,
              experienceCategory: categoriesMaps.get(categoryId)?.name,
              experienceCategoryType: categoriesMaps.get(categoryId)?.parent,
              evenStart: getLocaleDateTimeString(orderDetail.startTime, DATE_TIME_DOWNLOAD_FORMAT, options.timeZone, LanguageEnum.ENGLISH),
              eventEnd: getLocaleDateTimeString(orderDetail.endTime, DATE_TIME_DOWNLOAD_FORMAT, options.timeZone, LanguageEnum.ENGLISH)
            };
          }

          result.push(row);

          isFirstOrder = false;
        }
      }
    }

    return result;
  }

  private async getCategories(options: { language: LanguageEnum }) {
    const categories = await this.services.experienceCategoryService.getAllCategories();
    const categoriesMaps = new Map<number, Record<'name' | 'parent', string>>();
    categories.forEach(categoryType =>
      categoryType.subCategories.forEach(category => {
        categoriesMaps.set(category.id, { name: category.name[options.language], parent: categoryType.name[options.language] });
      })
    );
    return categoriesMaps;
  }

  private async getSSOUserList(orderDetails: IExperienceOrderDetailDao[]): Promise<Partial<IUser>[]> {
    const relevantUserIds: number[] = [];
    orderDetails.forEach(orderDetail =>
      orderDetail.reservations.forEach(reservation => {
        relevantUserIds.push(reservation.userId);
        if (reservation.assignedUserId) {
          relevantUserIds.push(reservation.assignedUserId);
        }
        if (reservation.checkinedUserId) {
          relevantUserIds.push(reservation.checkinedUserId);
        }
      })
    );

    const ssoUsers = await this.services.userService.getCombinedList(
      [...new Set(relevantUserIds)],
      ['id', 'name', 'photo', 'profession'],
      []
    );

    const userList: Partial<IUser>[] = [];

    ssoUsers.forEach(ssoUser => {
      userList.push({
        id: ssoUser.id,
        name: ssoUser.name,
        photo: ssoUser.photo,
        profession: ssoUser.profession
      });
    });

    return userList;
  }
}

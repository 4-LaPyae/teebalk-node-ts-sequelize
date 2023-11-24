import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { EmailNotification } from '../../constants';
import { IShopRepository } from '../../dal';
import { ExperienceEventTypeEnum, IExperienceOrderDetailModel, IExperienceOrderModel } from '../../database';
import { getDateString } from '../../helpers';
import { IEmailService } from '../email';
import { ExperienceOrderService } from '../experience-order';
import { ExperienceService } from '../experience/experience.service';
import { IUserService } from '../user';

const log = new Logger('SRV:ExperienceNotificationService');

export interface ExperienceNotificationServiceOptions {
  experienceService: ExperienceService;
  emailService: IEmailService;
  userService: IUserService;
  experienceOrderService: ExperienceOrderService;
  shopRepository: IShopRepository;
}

export class ExperienceNotificationService {
  private services: ExperienceNotificationServiceOptions;

  constructor(services: ExperienceNotificationServiceOptions) {
    this.services = services;
  }

  async sendEmailNotificationToCustomer(
    order: IExperienceOrderModel,
    orderDetails: IExperienceOrderDetailModel[],
    frontendUrl: string,
    transaction?: Transaction
  ) {
    try {
      const totalTickets = orderDetails.reduce((sum, current) => sum + current.quantity, 0);

      const { experienceId, experienceTitle, experienceImage, eventType, startTime, endTime, defaultTimezone } = orderDetails[0];

      const [experience, shopInfo, allTickets, { name, email, language }] = await Promise.all([
        this.services.experienceService.getOne({
          where: { id: experienceId },
          attributes: ['id', 'nameId', 'location']
        }),
        this.services.shopRepository.getById(order.shopId),
        this.services.experienceOrderService.getReservationsByOrderId(order.id, transaction),
        this.services.userService.getCombinedOne(order.userId, ['name', 'email', 'language'])
      ]);

      const { startTimeLatest, endTimeLatest, durationText, timeZone } = this.services.experienceService.getInfoPurchaseDateTime(
        startTime,
        endTime,
        order.purchaseTimezone,
        language
      );

      const defaultTime = this.services.experienceService.getInfoDefaultDateTime(startTime, endTime, defaultTimezone, language);

      const eventTypeTrans = this.services.experienceService.getEventTypeTranslation(eventType as ExperienceEventTypeEnum, language);
      const context = {
        frontendUrl,
        userName: name,
        orderId: order.code,
        experienceTitle,
        experienceImage,
        experienceLink: `${frontendUrl}/experiences/${experience.nameId}`,
        type: eventTypeTrans,
        startTimeLatest,
        endTimeLatest,
        durationText,
        timeZone,
        startTimeDefault: defaultTime.startTimeDefault,
        endTimeDefault: defaultTime.endTimeDefault,
        defaultDateTime: defaultTime.defaultDateTime,
        defaultTimeZone: defaultTime.defaultTimeZone,
        totalTickets,
        shopTitle: order.shopTitle,
        shopImage: shopInfo.images?.length ? shopInfo.images[0].imagePath : undefined,
        shopLink: `${frontendUrl}/shops/${shopInfo.nameId}`,
        shopEmail: shopInfo.email,
        totalPriceWithTax: '¥' + order.fiatAmount.toLocaleString(),
        usedCoins: order.usedCoins.toLocaleString(),
        totalAmount: '¥' + order.totalAmount.toLocaleString(),
        earnedCoins: order.earnedCoins.toLocaleString(),
        tickets: allTickets.map(item => {
          return {
            ticketID: item.ticketCode,
            title: item.title,
            price: '¥' + item.price.toLocaleString()
          };
        }),
        location: experience.location,
        language
      };

      // send email to buyer
      const emailNotification =
        experience.nameId === 'moff_2022'
          ? EmailNotification.TELLS_FWSHOP_CUSTOMER_EXPERIENCE_ORDER_COMPLETED_MOFF_2022
          : EmailNotification.TELLS_FWSHOP_CUSTOMER_EXPERIENCE_ORDER_COMPLETED;
      await this.services.emailService.sendEmail(email, emailNotification, context);

      log.verbose(`Email notification has been sent successfully to customer for order ${order.id}`);
    } catch (err) {
      log.error('Failed sending email:', err.message);
    }
  }

  async sendEmailNotificationToSellers(
    order: IExperienceOrderModel,
    orderDetails: IExperienceOrderDetailModel[],
    frontendUrl: string,
    adminEmail: string,
    transaction?: Transaction
  ) {
    try {
      const totalTickets = orderDetails.reduce((sum, current) => sum + current.quantity, 0);

      const { experienceId, experienceTitle, experienceImage, eventType, startTime, endTime, defaultTimezone } = orderDetails[0];

      const [experience, allTickets, userInfo] = await Promise.all([
        this.services.experienceService.getOne({
          where: { id: experienceId },
          attributes: ['id', 'nameId', 'location']
        }),
        this.services.experienceOrderService.getReservationsByOrderId(order.id, transaction),
        this.services.userService.getCombinedOne(order.userId, [
          'dateOfBirth',
          'firstName',
          'lastName',
          'gender',
          'profession',
          'email',
          'language'
        ] as any)
      ]);

      const { startTimeLatest, endTimeLatest, durationText, timeZone } = this.services.experienceService.getInfoPurchaseDateTime(
        startTime,
        endTime,
        order.purchaseTimezone,
        userInfo.language
      );

      const defaultTime = this.services.experienceService.getInfoDefaultDateTime(startTime, endTime, defaultTimezone, userInfo.language);

      const eventTypeTrans = this.services.experienceService.getEventTypeTranslation(
        eventType as ExperienceEventTypeEnum,
        userInfo.language
      );
      const dateOfBirth =
        !userInfo.dateOfBirth || userInfo.dateOfBirth === undefined ? undefined : getDateString(userInfo.dateOfBirth, userInfo.language);
      const context = {
        frontendUrl,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        birthday: dateOfBirth,
        gender: userInfo.gender,
        profession: userInfo.profession,
        email: userInfo.email,
        orderId: order.code,
        experienceTitle,
        experienceImage,
        experienceLink: `${frontendUrl}/experiences/${experience.nameId}`,
        type: eventTypeTrans,
        startTimeLatest,
        endTimeLatest,
        durationText,
        timeZone,
        startTimeDefault: defaultTime.startTimeDefault,
        endTimeDefault: defaultTime.endTimeDefault,
        defaultDateTime: defaultTime.defaultDateTime,
        defaultTimeZone: defaultTime.defaultTimeZone,
        totalTickets,
        shopTitle: order.shopTitle,
        totalPriceWithTax: '¥' + order.fiatAmount.toLocaleString(),
        usedCoins: order.usedCoins.toLocaleString(),
        totalAmount: '¥' + order.totalAmount.toLocaleString(),
        earnedCoins: order.earnedCoins.toLocaleString(),
        tickets: allTickets.map(item => {
          return {
            ticketID: item.ticketCode,
            title: item.title,
            price: '¥' + item.price.toLocaleString()
          };
        }),
        location: experience.location,
        language: userInfo.language
      };

      // send email to seller
      await this.services.emailService.sendEmailWithBcc(
        order.shopEmail,
        adminEmail,
        EmailNotification.TELLS_FWSHOP_SELLER_EXPERIENCE_ORDER_COMPLETED,
        context
      );

      log.verbose(`Email notification has been sent successfully to seller for order ${order.id}`);
    } catch (err) {
      log.error('Failed sending email:', err.message);
    }
  }
}

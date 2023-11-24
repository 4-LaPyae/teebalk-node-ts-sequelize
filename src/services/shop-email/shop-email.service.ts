import { LogMethodSignature } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import config from '../../config';
import { EmailNotification, ItemTypeEnum } from '../../constants';
import { IShopEmailSendHistoryRepository, IShopEmailTemplateRepository } from '../../dal';
import { IShopEmailTemplateModel } from '../../database';
import { EmailService } from '../email';

const log = new Logger('SRV:ShopService');

export interface ShopEmailServiceOptions {
  shopEmailTemplateRepository: IShopEmailTemplateRepository;
  shopEmailSendHistoryRepository: IShopEmailSendHistoryRepository;
  emailService: EmailService;
}

export class ShopEmailService {
  private services: ShopEmailServiceOptions;

  constructor(services: ShopEmailServiceOptions) {
    this.services = services;
  }

  @LogMethodSignature(log)
  async sendEmail(
    shopId: number,
    itemType: ItemTypeEnum,
    orderId: number,
    templateId: number,
    { to, cc, shopNameId, shopTitle, shopEmail, shopImageUrl, userName, emailSubject, emailBody, language }: any,
    sendUserId: number,
    transaction?: Transaction
  ): Promise<void> {
    const from = config.get('orderEmail');
    const frontendUrl = config.get('frontendUrl');

    await this.services.emailService.sendEmailWithFrom(
      from,
      to,
      EmailNotification.TELLS_FWSHOP_SELLER_DASHBOARD_SEND_TO_CUSTOMER,
      {
        shopLink: `${frontendUrl}/shops/${shopNameId}`,
        shopTitle,
        shopEmail,
        shopImage: shopImageUrl,
        userName,
        emailSubject: emailSubject || '',
        emailBody,
        language,
        frontendUrl
      },
      cc
    );

    await this.services.shopEmailSendHistoryRepository.create(
      {
        shopId,
        itemType,
        orderId,
        templateId,
        from,
        to,
        emailSubject,
        emailBody,
        language,
        sendUserId
      },
      { transaction }
    );
  }

  @LogMethodSignature(log)
  async sendTestEmail(
    { to, shopNameId, shopTitle, shopEmail, shopImageUrl, userName, emailSubject, emailBody, language }: any,
    transaction?: Transaction
  ): Promise<void> {
    const from = config.get('orderEmail');
    const frontendUrl = config.get('frontendUrl');

    await this.services.emailService.sendEmailWithFrom(from, to, EmailNotification.TELLS_FWSHOP_SELLER_DASHBOARD_SEND_TO_CUSTOMER, {
      shopLink: `${frontendUrl}/shops/${shopNameId}`,
      shopTitle,
      shopEmail,
      shopImage: shopImageUrl,
      userName,
      emailSubject: emailSubject || '',
      emailBody,
      language,
      frontendUrl
    });
  }

  @LogMethodSignature(log)
  getEmailTemplate(shopId: number, templateId: number): Promise<Partial<IShopEmailTemplateModel>> {
    return this.services.shopEmailTemplateRepository.findOne({ where: { id: templateId, shopId } });
  }

  @LogMethodSignature(log)
  getEmailTemplateList(shopId: number): Promise<Partial<IShopEmailTemplateModel>[]> {
    return this.services.shopEmailTemplateRepository.findAll({ where: { shopId } });
  }

  @LogMethodSignature(log)
  createEmailTemplate(
    shopId: number,
    newData: Partial<IShopEmailTemplateModel>,
    transaction?: Transaction
  ): Promise<IShopEmailTemplateModel> {
    return this.services.shopEmailTemplateRepository.create({ ...newData, shopId }, { transaction });
  }

  @LogMethodSignature(log)
  updateEmailTemplate(
    shopId: number,
    templateId: number,
    patchData: Partial<IShopEmailTemplateModel>,
    transaction?: Transaction
  ): Promise<Partial<IShopEmailTemplateModel>> {
    return this.services.shopEmailTemplateRepository.update(patchData, { where: { id: templateId, shopId }, transaction });
  }

  @LogMethodSignature(log)
  deleteEmailTemplate(shopId: number, templateId: number, transaction?: Transaction): Promise<any> {
    return this.services.shopEmailTemplateRepository.delete({ where: { id: templateId, shopId }, transaction });
  }
}

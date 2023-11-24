import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { ItemTypeEnum } from '../../constants';
import { IShopEmailTemplateModel, IShopModel, ShopContentDbModel, ShopImageDbModel, Transactional } from '../../database';
import { ApiError } from '../../errors';
import { LogMethodSignature } from '../../logger';
import { BaseController } from '../_base/base.controller';

import { IShopEmailControllerServices } from './interfaces';

const log = new Logger('CTR:ShopEmailController');

export class ShopEmailController extends BaseController<IShopEmailControllerServices> {
  @LogMethodSignature(log)
  @Transactional
  async orderSendShopEmail(
    shop: IShopModel,
    orderId: number,
    { templateId, emailSubject, emailBody }: any,
    userId: number,
    transaction?: Transaction
  ): Promise<void> {
    const order = await this.services.orderService.getShopOrderSimpleOne(shop.id, orderId);

    if (!shop || !order) {
      throw ApiError.notFound();
    }

    await this.sendShopEmail(
      shop,
      ItemTypeEnum.PRODUCT,
      orderId,
      order.userId,
      { templateId, emailSubject, emailBody },
      userId,
      transaction
    );
  }

  @LogMethodSignature(log)
  @Transactional
  async orderSendShopTestEmail(
    shop: IShopModel,
    orderId: number,
    { to, emailSubject, emailBody }: any,
    transaction?: Transaction
  ): Promise<void> {
    const order = await this.services.orderService.getShopOrderSimpleOne(shop.id, orderId);

    if (!shop || !order) {
      throw ApiError.notFound();
    }

    await this.sendShopTestEmail(shop, order.userId, { to, emailSubject, emailBody }, transaction);
  }

  @LogMethodSignature(log)
  @Transactional
  async instoreOrderShopSendEmail(
    shop: IShopModel,
    orderId: number,
    { templateId, emailSubject, emailBody }: any,
    userId: number,
    transaction?: Transaction
  ): Promise<void> {
    const order = await this.services.instoreOrderService.getShopOrderSimpleOne(shop.id, orderId);

    if (!shop || !order) {
      throw ApiError.notFound();
    }

    await this.sendShopEmail(
      shop,
      ItemTypeEnum.INSTORE_PRODUCT,
      orderId,
      order.userId as number,
      { templateId, emailSubject, emailBody },
      userId,
      transaction
    );
  }

  @LogMethodSignature(log)
  @Transactional
  async instoreOrderSendShopTestEmail(
    shop: IShopModel,
    orderId: number,
    { to, emailSubject, emailBody }: any,
    transaction?: Transaction
  ): Promise<void> {
    const order = await this.services.instoreOrderService.getShopOrderSimpleOne(shop.id, orderId);

    if (!shop || !order) {
      throw ApiError.notFound();
    }

    await this.sendShopTestEmail(shop, order.userId as number, { to, emailSubject, emailBody }, transaction);
  }

  @LogMethodSignature(log)
  getEmailTemplate(shopId: number, templateId: number): Promise<Partial<IShopEmailTemplateModel>> {
    return this.services.shopEmailService.getEmailTemplate(shopId, templateId);
  }

  @LogMethodSignature(log)
  getEmailTemplateList(shopId: number): Promise<Partial<IShopEmailTemplateModel>[]> {
    return this.services.shopEmailService.getEmailTemplateList(shopId);
  }

  @LogMethodSignature(log)
  @Transactional
  createEmailTemplate(
    shopId: number,
    newData: Partial<IShopEmailTemplateModel>,
    transaction?: Transaction
  ): Promise<IShopEmailTemplateModel> {
    return this.services.shopEmailService.createEmailTemplate(shopId, newData, transaction);
  }

  @LogMethodSignature(log)
  @Transactional
  async updateEmailTemplate(
    shopId: number,
    templateId: number,
    patchData: Partial<IShopEmailTemplateModel>,
    transaction?: Transaction
  ): Promise<boolean> {
    await this.services.shopEmailService.updateEmailTemplate(shopId, templateId, patchData, transaction);
    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async deleteEmailTemplate(shopId: number, templateId: number, transaction?: Transaction): Promise<boolean> {
    await this.services.shopEmailService.deleteEmailTemplate(shopId, templateId, transaction);
    return true;
  }

  private async sendShopEmail(
    shop: IShopModel,
    itemType: ItemTypeEnum,
    orderId: number,
    orderUserId: number,
    { templateId, emailSubject, emailBody }: any,
    userId: number,
    transaction?: Transaction
  ): Promise<void> {
    const { name, email, language } = await this.services.userService.getCombinedOne(orderUserId, ['name', 'email', 'language']);

    const shopDao = await this.services.shopService.getShopDao(
      {
        where: { id: shop.id },
        include: [
          {
            as: 'contents',
            model: ShopContentDbModel,
            separate: true,
            attributes: ['title', 'subTitle', 'description', 'policy', 'isOrigin', 'language']
          },
          {
            as: 'images',
            model: ShopImageDbModel,
            separate: true,
            attributes: ['id', 'imagePath', 'imageDescription', 'isOrigin', 'language']
          }
        ]
      },
      language
    );

    await this.services.shopEmailService.sendEmail(
      shop.id,
      itemType,
      orderId,
      templateId,
      {
        to: email,
        cc: shop.email,
        shopNameId: shop.nameId,
        shopTitle: shopDao.content?.title,
        shopEmail: shop.email,
        shopImageUrl: shopDao.image?.imagePath,
        userName: name,
        emailSubject,
        emailBody,
        language
      },
      userId,
      transaction
    );
  }

  private async sendShopTestEmail(
    shop: IShopModel,
    orderUserId: number,
    { to, emailSubject, emailBody }: any,
    transaction?: Transaction
  ): Promise<void> {
    const { name, language } = await this.services.userService.getCombinedOne(orderUserId, ['name', 'email', 'language']);

    const shopDao = await this.services.shopService.getShopDao(
      {
        where: { id: shop.id },
        include: [
          {
            as: 'contents',
            model: ShopContentDbModel,
            separate: true,
            attributes: ['title', 'subTitle', 'description', 'policy', 'isOrigin', 'language']
          },
          {
            as: 'images',
            model: ShopImageDbModel,
            separate: true,
            attributes: ['id', 'imagePath', 'imageDescription', 'isOrigin', 'language']
          }
        ]
      },
      language
    );

    await this.services.shopEmailService.sendTestEmail(
      {
        to,
        shopNameId: shop.nameId,
        shopTitle: shopDao.content?.title,
        shopEmail: shop.email,
        shopImageUrl: shopDao.image?.imagePath,
        userName: name,
        emailSubject,
        emailBody,
        language
      },
      transaction
    );
  }
}

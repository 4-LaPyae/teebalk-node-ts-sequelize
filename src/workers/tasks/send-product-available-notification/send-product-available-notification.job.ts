import Logger from '@freewilltokyo/logger';
import _ from 'lodash';

import config from '../../../config';
import { EmailNotification } from '../../../constants';
import { IPartialDetailCartItem } from '../../../controllers/cart/interfaces';
import { AuditProductService, CartService, EmailService, IUser, UserService } from '../../../services';
import { TaskIdEnum } from '../../enums';
import { BaseWorkerTask } from '../_base';

const log = new Logger('WORKER:SendProductAvailableNotification');

export interface AvailableProductNotification {
  customer: IUser;
  products: IPartialDetailCartItem[];
}
export class SendProductAvailableNotification extends BaseWorkerTask {
  private auditProductService: AuditProductService;
  private cartService: CartService;
  private userService: UserService;
  private emailService: EmailService;

  constructor(auditProductService: AuditProductService, cartService: CartService, userService: UserService, emailService: EmailService) {
    super();
    this.auditProductService = auditProductService;
    this.cartService = cartService;
    this.userService = userService;
    this.emailService = emailService;
  }

  get action() {
    return TaskIdEnum.SEND_PRODUCT_AVAILABLE_NOTIFICATION;
  }

  async exec(): Promise<void> {
    log.verbose('Executing task', this.action);

    try {
      const cartItemList = await this.cartService.getAvailableProductsNotificationCartItems();

      const frontendUrl = config.get('frontendUrl');

      const groupProductsByCustomer = await this.groupProductsByCustomer(cartItemList);

      for (const groupedProduct of groupProductsByCustomer) {
        await this.sendEmailToCustomer(frontendUrl, groupedProduct);
      }

      await this.auditProductService.setNotifiedProductAvailableNotifications([
        ...new Set(cartItemList.map(cartitem => cartitem.productId))
      ]);
    } catch (err) {
      log.error(err);
    }
  }

  private async groupProductsByCustomer(cartList: IPartialDetailCartItem[]): Promise<AvailableProductNotification[]> {
    const productsGroupedByCustomer = _.chain(cartList)
      .groupBy(item => item.userId)
      .map(value => value)
      .value();

    const availableProductsByCustomer: AvailableProductNotification[] = [];

    for (const productGroupedByCustomer of productsGroupedByCustomer) {
      const userId = productGroupedByCustomer[0].userId;
      const customer = await this.userService.getCombinedOne(userId, ['name', 'email', 'language']);

      availableProductsByCustomer.push({ customer, products: cartList.filter(x => x.userId === userId) });
    }

    return availableProductsByCustomer;
  }

  private async sendEmailToCustomer(frontendUrl: string, availableProductNotification: AvailableProductNotification) {
    const products = _.uniqWith(
      availableProductNotification.products.map(purchaseProduct => {
        const colorName = purchaseProduct.productDetail?.hasParameters
          ? purchaseProduct.productDetail?.colors?.find(color => color.id === purchaseProduct.colorId)?.color || ''
          : '';
        const patternName = purchaseProduct.productDetail?.hasParameters
          ? purchaseProduct.productDetail?.patterns?.find(pattern => pattern.id === purchaseProduct.patternId)?.pattern || ''
          : '';
        const customParameterName = purchaseProduct.productDetail?.hasParameters
          ? purchaseProduct.productDetail?.customParameters?.find(
              customParameter => customParameter.id === purchaseProduct.customParameterId
            )?.customParameter || ''
          : '';

        return {
          productId: purchaseProduct.productId,
          productTitle: purchaseProduct.productDetail?.content?.title,
          colorName,
          patternName,
          customParameterName,
          productLink: `${frontendUrl}/products/${purchaseProduct.productDetail?.nameId}`,
          productPrice: '¥' + purchaseProduct.productDetail?.priceWithTax?.toLocaleString(),
          productQuantity: purchaseProduct.quantity,
          shopTitle: purchaseProduct.productDetail?.shop?.content?.title,
          shopEmail: purchaseProduct.productDetail?.shop?.email,
          productName: purchaseProduct.productDetail?.nameId,
          shopProfileLink: `${frontendUrl}/shops/${purchaseProduct.productDetail?.shop?.nameId}`
        };
      }),
      _.isEqual
    );

    const context = {
      frontendUrl,
      userName: availableProductNotification.customer.name,
      products,
      language: availableProductNotification.customer.language,
      goToCartLink: availableProductNotification.products.map(product => `productIds=${product.productDetail?.nameId}`).join('&')
    };
    await this.emailService.sendEmail(availableProductNotification.customer.email, EmailNotification.TELLS_PRODUCT_AVAILABLE, context);
  }
}

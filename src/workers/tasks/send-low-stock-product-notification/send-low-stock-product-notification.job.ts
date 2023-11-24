import Logger from '@freewilltokyo/logger';
import _ from 'lodash';

import config from '../../../config';
import { EmailNotification } from '../../../constants';
import { IConfigRepository, ILowStockProductNotificationRepository, IProductDao } from '../../../dal';
import { selectWithLanguage } from '../../../helpers';
import { IEmailService, IUser, ProductService, UserService } from '../../../services';
import { TaskIdEnum } from '../../enums';
import { BaseWorkerTask } from '../_base';

const log = new Logger('WORKER:SendLowStockProductNotification');

export interface LowStockProductNotification {
  seller: IUser;
  products: IProductDao[];
}

export class SendLowStockProductNotification extends BaseWorkerTask {
  private productService: ProductService;
  private emailService: IEmailService;
  private userService: UserService;
  private lowStockProductNotificationRepository: ILowStockProductNotificationRepository;
  private configRepository: IConfigRepository;

  constructor(
    productService: ProductService,
    emailService: IEmailService,
    userService: UserService,
    lowStockProductNotificationRepository: ILowStockProductNotificationRepository,
    configRepository: IConfigRepository
  ) {
    super();

    this.productService = productService;
    this.emailService = emailService;
    this.userService = userService;
    this.lowStockProductNotificationRepository = lowStockProductNotificationRepository;
    this.configRepository = configRepository;
  }

  get action() {
    return TaskIdEnum.SEND_LOW_STOCK_PRODUCT_NOTIFICATION;
  }

  async exec(): Promise<void> {
    log.verbose('Executing task', this.action);

    try {
      const [products, lowNumberOfStock] = await Promise.all([
        this.productService.getLowStockNotificationProducts(),
        this.configRepository.getLowNumberOfStock()
      ]);

      const groupedProductsByShop = await this.groupProductsByShop(products);
      const frontendUrl = config.get('frontendUrl');

      for (const groupedProduct of groupedProductsByShop) {
        await this.sendEmailToSeller(frontendUrl, lowNumberOfStock, groupedProduct);
        const productIds = groupedProduct.products.map(product => product.id);

        await this.lowStockProductNotificationRepository.update(
          { notifiedAt: new Date().toUTCString() },
          {
            where: {
              productId: productIds,
              notifiedAt: null
            }
          }
        );
      }
    } catch (err) {
      log.error(err);
    }
  }

  private async groupProductsByShop(products: IProductDao[]): Promise<LowStockProductNotification[]> {
    const productsGroupedByShop = _.chain(products)
      .groupBy(product => product.shop.id)
      .map(value => value)
      .value();

    const lowStockProductsByShop: LowStockProductNotification[] = [];

    for (const productGroupedByShop of productsGroupedByShop) {
      const shop = productGroupedByShop[0].shop;
      const seller = await this.userService.getCombinedOne(shop.userId, ['name', 'email', 'language']);

      lowStockProductsByShop.push({ seller, products: products.filter(product => product.shopId === shop.id) });
    }

    return lowStockProductsByShop;
  }

  private async sendEmailToSeller(frontendUrl: string, lowNumberOfStock: number, lowStockProductNotification: LowStockProductNotification) {
    const context = {
      frontendUrl,
      userName: lowStockProductNotification.seller.name,
      lowNumberOfStock,
      products: lowStockProductNotification.products.map(product => {
        const productContent: any = selectWithLanguage(product.contents);

        return {
          productId: product.id,
          productName: product.nameId,
          productTitle: productContent.title,
          productLink: `${frontendUrl}/products/${product.nameId}`,
          productPrice: '¥' + product.price?.toLocaleString(),
          numberOfStock: product.stock || 0
        };
      }),
      language: lowStockProductNotification.seller.language
    };

    await this.emailService.sendEmail(
      lowStockProductNotification.seller.email,
      EmailNotification.TELLS_FWSHOP_LOW_STOCK_PRODUCTS_NOTIFICATION,
      context
    );
  }
}

import { TransactionActionEnum } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { LocalPaymentClient } from '../../clients';
import config from '../../config';
import { EmailNotification, LanguageEnum } from '../../constants';
import { CoinActionQueueRepository } from '../../dal';
import { CoinActionQueueStatusEnum, ICoinActionQueueModel } from '../../database/models';
import { getLocaleDateTimeString } from '../../helpers';
import { EmailService } from '../email';
import { EMAIL_DATE_FORMATS } from '../experience';
import { UserService } from '../user';

const log = new Logger('SRV:CoinActionQueueService');

export interface CoinActionQueueServiceOptions {
  coinActionQueueRepository: CoinActionQueueRepository;
  paymentClient: LocalPaymentClient;
  emailService: EmailService;
  userService: UserService;
}

export class CoinActionQueueService {
  private services: CoinActionQueueServiceOptions;

  constructor(services: CoinActionQueueServiceOptions) {
    this.services = services;
  }

  addActions(actions: ICoinActionQueueModel[], transaction?: Transaction): Promise<any> {
    return this.services.coinActionQueueRepository.bulkCreate(actions, { transaction });
  }

  async execQueue(now: Date) {
    const targetActions = await this.getTargetActions();

    // const promise = targetActions.map(action => this.execAction(action, now));

    // Promise.all(promise);

    try {
      for (const action of targetActions) {
        this.execAction(action, now);
      }
    } catch (err) {
      log.error(err);
      throw new Error((err as any).message);
    }
  }

  getTargetActions(): Promise<ICoinActionQueueModel[]> {
    return this.services.coinActionQueueRepository.findAll({
      where: { status: CoinActionQueueStatusEnum.CREATED },
      limit: 20,
      offset: 0
    });
  }

  async execAction(action: ICoinActionQueueModel, now: Date) {
    log.verbose('Executing action', action);

    if (!this.checkAction(action, now)) {
      return;
    }

    await this.updateStatus(action.id, CoinActionQueueStatusEnum.IN_PROGRESS);

    await this.execCoin(action);
    log.verbose('Finished earnedCoin. id:', action.id);

    await this.sendEmail(action, now);
    log.verbose('Finished sendEmail. id:', action.id);

    await this.updateStatus(action.id, CoinActionQueueStatusEnum.COMPLETED);

    log.verbose('Finished action. id:', action.id);
  }

  checkAction(action: ICoinActionQueueModel, now: Date): boolean {
    if (!action.startedAt) {
      return true;
    }

    if (now < new Date(action.startedAt)) {
      return false;
    }

    if (
      ![
        TransactionActionEnum.COIN_PRODUCT_PURCHASE_CASHBACK,
        TransactionActionEnum.COIN_STORE_PURCHASE_CASHBACK,
        TransactionActionEnum.COIN_EXPERIENCE_PURCHASE_CASHBACK,
        TransactionActionEnum.COIN_EXPERIENCE_PURCHASE_CHARGE,
        TransactionActionEnum.COIN_EXPERIENCE_PURCHASE_CHARGE_MOFF2022,
        TransactionActionEnum.COIN_PRODUCT_PURCHASE,
        TransactionActionEnum.COIN_STORE_PURCHASE,
        TransactionActionEnum.COIN_EXPERIENCE_PURCHASE
      ].includes(action.action)
    ) {
      return false;
    }

    return true;
  }

  updateStatus(id: number, status: CoinActionQueueStatusEnum, transaction?: Transaction): Promise<Partial<ICoinActionQueueModel>> {
    return this.services.coinActionQueueRepository.update({ status }, { where: { id }, transaction });
  }

  execCoin(action: ICoinActionQueueModel): Promise<any> {
    try {
      switch (action.action) {
        case TransactionActionEnum.COIN_PRODUCT_PURCHASE_CASHBACK:
        case TransactionActionEnum.COIN_STORE_PURCHASE_CASHBACK:
        case TransactionActionEnum.COIN_EXPERIENCE_PURCHASE_CASHBACK:
        case TransactionActionEnum.COIN_EXPERIENCE_PURCHASE_CHARGE:
        case TransactionActionEnum.COIN_EXPERIENCE_PURCHASE_CHARGE_MOFF2022:
          return this.services.paymentClient.addCashBackCoin(
            {
              userExternalId: action.userExternalId,
              assetId: action.assetId,
              title: action.title,
              amount: action.amount
            },
            action.action
          );

        case TransactionActionEnum.COIN_PRODUCT_PURCHASE:
        case TransactionActionEnum.COIN_STORE_PURCHASE:
        case TransactionActionEnum.COIN_EXPERIENCE_PURCHASE:
          return this.services.paymentClient.spendCoinTokens(
            action.userExternalId,
            action.title,
            action.amount,
            action.assetId,
            action.action
          );

        default:
          throw new Error(`This action is not available. action: ${action.action}`);
      }
    } catch (err) {
      log.error(`Error durring call to Payment Service: ${JSON.stringify(err)}`);
      throw new Error((err as any).message);
    }
  }

  async sendEmail(action: ICoinActionQueueModel, now: Date): Promise<void> {
    if (action.action !== TransactionActionEnum.COIN_EXPERIENCE_PURCHASE_CHARGE_MOFF2022) {
      return;
    }

    try {
      const frontendUrl = config.get('frontendUrl');
      const { name, email, language } = await this.services.userService.getCombinedOne(action.userId, ['name', 'email', 'language']);
      const formatDate = language === LanguageEnum.JAPANESE ? EMAIL_DATE_FORMATS.DATE_FORMAT_JA : EMAIL_DATE_FORMATS.DATE_FORMAT_EN;
      const earnedDatetime = getLocaleDateTimeString(now.toISOString(), formatDate, 'Asia/Tokyo', language);
      const context = {
        frontendUrl,
        userName: name,
        tellsUserId: action.userId,
        walletLink: `${frontendUrl}/profile/${action.userId}`,
        coinAmount: action.amount.toLocaleString(),
        earnedDatetime,
        language
      };

      await this.services.emailService.sendEmail(email, EmailNotification.TELLS_FWSHOP_CUSTOMER_MINT_CHARGE_MOFF_2022, context);

      log.verbose(`Email notification has been sent successfully`, context);
    } catch (err) {
      log.error('Failed sending email:', err.message);
    }
  }
}

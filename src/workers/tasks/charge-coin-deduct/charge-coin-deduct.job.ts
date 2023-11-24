import { ApiError, LogMethodFail } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';

import { IChargeTxDAO, /* IChargeTxModel, */ LocalPaymentClient } from '../../../clients';
// import config from '../../../config';
// import { EmailNotification, LanguageEnum } from '../../../constants';
// import { getLocaleDateTimeString } from '../../../helpers';
import { /* EMAIL_DATE_FORMATS, */ EmailService, UserService } from '../../../services';
import { TaskIdEnum } from '../../enums';
import { BaseWorkerTask } from '../_base';

const log = new Logger('WORKER:ChargeCoinDeduct');

export class ChargeCoinDeduct extends BaseWorkerTask {
  private paymentClient: LocalPaymentClient;
  // private emailService: EmailService;
  // private userService: UserService;

  constructor(paymentClient: LocalPaymentClient, emailService: EmailService, userService: UserService) {
    super();
    this.paymentClient = paymentClient;
    // this.emailService = emailService;
    // this.userService = userService;
  }

  get action() {
    return TaskIdEnum.CHARGE_COIN_DEDUCT;
  }

  async exec(): Promise<void> {
    log.verbose('Executing task', this.action);

    const targetTx = await this.getExpiredCargeTx();

    if (!targetTx.length) {
      return;
    }

    const txMap = await this.groupByUserExternalId(targetTx);

    // const executeDeductions = Array.from(txMap.keys()).map(async targetUserExternalId => {
    Array.from(txMap.keys()).forEach(async targetUserExternalId => {
      try {
        const targets = txMap.get(targetUserExternalId);
        if (!targets || !targets.length) {
          throw ApiError.notFound();
        }
        await this.paymentClient.deductCargeTx(targets.map(t => t.id));
        // const deductionValue = this.getSummaryAmount(targets);
        // await this.sendMOFF2022Email(targetUserExternalId, deductionValue);
      } catch (err) {
        log.error(err);
      }
    });

    // Promise.all(executeDeductions);
  }

  @LogMethodFail(log)
  private getExpiredCargeTx(): Promise<IChargeTxDAO[]> {
    return this.paymentClient.getExpiredCargeTx();
  }

  private groupByUserExternalId(cargeTx: IChargeTxDAO[]): Map<number, IChargeTxDAO[]> {
    return cargeTx.reduce((map, cur) => {
      const key = cur.user.externalId;
      const list = map.get(key);

      if (list) {
        list.push(cur);
      } else {
        map.set(key, [cur]);
      }

      return map;
    }, new Map<number, IChargeTxDAO[]>());
  }

  // private getSummaryAmount(cargeTx: IChargeTxModel[] | undefined): number {
  //   return cargeTx?.reduce((sum, cur) => sum + cur.amount, 0) || 0;
  // }

  // private async sendMOFF2022Email(userExternalId: number, deductionValue: number): Promise<void> {
  //   try {
  //     const frontendUrl = config.get('frontendUrl');
  //     const { id, name, email, language } = await this.userService.getCombinedOneByUserExternalId(
  //       userExternalId,
  //       ['name', 'email', 'language'],
  //       []
  //     );
  //     const formatDate = language === LanguageEnum.JAPANESE ? EMAIL_DATE_FORMATS.DATE_FORMAT_JA : EMAIL_DATE_FORMATS.DATE_FORMAT_EN;
  //     const deductionDatetime = getLocaleDateTimeString(new Date().toISOString(), formatDate, 'Asia/Tokyo', language);
  //     const context = {
  //       frontendUrl,
  //       userName: name,
  //       tellsUserId: id,
  //       walletLink: `${frontendUrl}/profile/${id}`,
  //       coinAmount: deductionValue.toLocaleString(),
  //       deductionDatetime,
  //       language
  //     };

  //     await this.emailService.sendEmail(email, EmailNotification.TELLS_FWSHOP_CUSTOMER_DEDUCTION_CHARGE_MOFF_2022, context);

  //     log.verbose(`Email notification has been sent successfully`, context);
  //   } catch (err) {
  //     log.error('Failed sending email:', err.message);
  //   }
  // }
}

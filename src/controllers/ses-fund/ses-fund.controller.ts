import Logger from '@freewilltokyo/logger';

import { DEFAULT_LIMIT } from '../../constants';
import { LogMethodSignature } from '../../logger';
import { BaseController } from '../_base/base.controller';

import { ICoinTransferSortQuery, ICoinTransferTransactionList, ISesFundControllerServices } from './interface';

const log = new Logger('CTR:SesFundController');

export class SesFundController extends BaseController<ISesFundControllerServices> {
  @LogMethodSignature(log)
  async getAllCoinTransferTransactions(sortQuery: ICoinTransferSortQuery): Promise<ICoinTransferTransactionList> {
    const coinTransferTransactions = await this.services.sesFundService.getAllCoinTransferTransactions(sortQuery);
    return coinTransferTransactions;
  }

  @LogMethodSignature(log)
  async getLastIncomingTransactions(opstions: { limit: number }): Promise<ICoinTransferTransactionList> {
    const coinTransferTransactions = await this.services.sesFundService.getLastIncomingTransactions(opstions?.limit || DEFAULT_LIMIT);
    return coinTransferTransactions as ICoinTransferTransactionList;
  }

  @LogMethodSignature(log)
  async getTotalIncomingAmount(): Promise<number> {
    const totalBalance = await this.services.sesFundService.getTotalIncomingAmount();
    return totalBalance;
  }
}

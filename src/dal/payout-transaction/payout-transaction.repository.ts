import { Transaction } from 'sequelize';

import { IPayoutTransactionModel, PayoutTransactionDbModel, PayoutTransactionStatusEnum } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export interface IPayoutTransactionRepository extends IRepository<IPayoutTransactionModel> {
  updateStatusByPayoutId(payoutId: string, status: PayoutTransactionStatusEnum, transaction?: Transaction): Promise<any>;
}

export type IPayoutTransactionDao = IPayoutTransactionModel;

export class PayoutTransactionRepository extends BaseRepository<IPayoutTransactionModel> implements IPayoutTransactionRepository {
  constructor() {
    super(PayoutTransactionDbModel);
  }

  updateStatusByPayoutId(payoutId: string, status: PayoutTransactionStatusEnum, transaction?: Transaction) {
    return this.update({ status }, { where: { payoutId }, transaction });
  }
}

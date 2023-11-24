import { IPaymentTransactionModel, PaymentTransactionDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IPaymentTransactionRepository = IRepository<IPaymentTransactionModel>;

export type IPaymentTransactionDao = IPaymentTransactionModel;

export class PaymentTransactionRepository extends BaseRepository<IPaymentTransactionModel> implements IPaymentTransactionRepository {
  constructor() {
    super(PaymentTransactionDbModel);
  }
}

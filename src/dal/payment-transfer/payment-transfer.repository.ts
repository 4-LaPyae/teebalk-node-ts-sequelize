import { IPaymentTransferModel, PaymentTransferDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export type IPaymentTransferRepository = IRepository<IPaymentTransferModel>;

export class PaymentTransferRepository extends BaseRepository<IPaymentTransferModel> implements IPaymentTransferRepository {
  constructor() {
    super(PaymentTransferDbModel);
  }
}

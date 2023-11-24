import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER } from '../../constants';
import { ICoinTransferSortQuery } from '../../controllers/ses-fund/interface';
import { CoinTransferTransactionDbModel, ICoinTransferTransactionModel } from '../../database/models';
import { BaseRepository, IFindAndCountResult, IRepository } from '../_base';

export interface ICoinTransferTransactionRepository extends IRepository<ICoinTransferTransactionModel> {
  getAllCoinTransferTransactions(optionsQuery: ICoinTransferSortQuery): Promise<IFindAndCountResult<ICoinTransferTransactionModel>>;
}
export class CoinTransferTransactionRepository extends BaseRepository<ICoinTransferTransactionModel>
  implements ICoinTransferTransactionRepository {
  constructor() {
    super(CoinTransferTransactionDbModel);
  }

  getAllCoinTransferTransactions(optionsQuery: ICoinTransferSortQuery): Promise<IFindAndCountResult<ICoinTransferTransactionModel>> {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER } = optionsQuery;
    const offset = (pageNumber - 1) * limit;

    return this.findAndCountAll({
      limit,
      offset,
      ...optionsQuery,
      attributes: ['userId', 'amount', 'type', 'metadata']
    });
  }
}

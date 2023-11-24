import { ApiError, LogMethodSignature, TransactionActionEnum } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import sequelize from 'sequelize';
import { col, fn } from 'sequelize';

import { BlockchainTxStatusEnum, ContractNameEnum, ITransactionDAO, paymentClient } from '../../clients';
import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER, LanguageEnum } from '../../constants';
import { ICoinTransferSortQuery, ICoinTransferTransactionList } from '../../controllers/ses-fund/interface';
import { ICoinTransferTransactionRepository } from '../../dal';
import { CoinTransferTransactionTypeEnum, ICoinTransferTransactionModel } from '../../database';
import { getPaginationMetaData, getUTCDateWithoutTime, IPaginationInfoParams } from '../../helpers';
import { IUser } from '../auth';
import { ICoinTransferTransaction } from '../ses-fund/interface';
import { IUserService } from '../user';

const log = new Logger('SRV:SesFundServiceOptions');

export interface SesFundServiceOptions {
  coinTransferTransactionRepository: ICoinTransferTransactionRepository;
  userService: IUserService;
}
export class SesFundService {
  private services: SesFundServiceOptions;

  constructor(services: SesFundServiceOptions) {
    this.services = services;
  }

  async getAllCoinTransferTransactions(optionsQuery: ICoinTransferSortQuery): Promise<ICoinTransferTransactionList> {
    const { limit = DEFAULT_LIMIT } = optionsQuery;

    let coinTransferTransactions = await this.services.coinTransferTransactionRepository.getAllCoinTransferTransactions(optionsQuery);
    let { pageNumber = DEFAULT_PAGE_NUMBER } = optionsQuery;
    let { count } = coinTransferTransactions;

    while (coinTransferTransactions.rows.length === 0 && count > 0) {
      pageNumber = Math.ceil(count / limit);
      const newSearchQuery = {
        ...optionsQuery,
        pageNumber
      };
      coinTransferTransactions = await this.services.coinTransferTransactionRepository.getAllCoinTransferTransactions(newSearchQuery);
      count = coinTransferTransactions.count;
    }

    const paginationInfoParams: IPaginationInfoParams = {
      limit,
      pageNumber,
      count
    };

    const metadata = getPaginationMetaData(paginationInfoParams);
    const data = (await this.mappingCoinTransferResponse(
      coinTransferTransactions.rows,
      optionsQuery.language
    )) as ICoinTransferTransaction[];

    return {
      count,
      metadata,
      rows: data
    };
  }

  @LogMethodSignature(log)
  async getLastIncomingTransactions(limit: number) {
    // const transactions = await paymentClient.getIncomingTransactionsOfSesFund({ limit });
    const transactions = await paymentClient.getTransactions({
      contract: [ContractNameEnum.COIN_TOKEN],
      action: [TransactionActionEnum.COIN_DEDUCTION, TransactionActionEnum.COIN_USER_TRANSFER_BURN],
      status: [BlockchainTxStatusEnum.PENDING, BlockchainTxStatusEnum.SUCCEED],
      limit,
      offset: 0
    });

    const data = await this.mappingBlockchainTxResponse(transactions);

    return {
      rows: data
    };
  }

  async getTotalIncomingAmount(): Promise<number> {
    let totalBalance = await this.getTotalIncomingAmountToday();
    try {
      const seSFundWalletBalance = await paymentClient.getSeSFundWalletBalance();
      totalBalance += seSFundWalletBalance?.totalIngoingAmount?.newValue || 0;
    } catch (err) {
      throw ApiError.internal(err?.message);
    }
    return totalBalance;
  }

  private async mappingCoinTransferResponse(
    coinTransferTransactions: ICoinTransferTransactionModel[],
    language?: LanguageEnum
  ): Promise<ICoinTransferTransaction[]> {
    const userIds = [...new Set(coinTransferTransactions.map(item => item.userId))];
    const customers = await this.services.userService.getCombinedList(userIds, ['id', 'name', 'photo', 'profession'], []);

    return Promise.all(
      coinTransferTransactions.map(item => {
        const customer = item.userId ? customers.get(item.userId) : null;

        const result = {
          ...item,
          name: customer?.name,
          photo: customer?.photo,
          occupation: customer?.profession
        } as ICoinTransferTransaction;

        return result;
      })
    );
  }

  @LogMethodSignature(log)
  private async mappingBlockchainTxResponse(transactions: ITransactionDAO[]): Promise<ICoinTransferTransaction[]> {
    const externalIds = [...new Set(transactions.map(item => item.from.externalId))];

    const [ssoUsers, localUsers] = await Promise.all([
      this.services.userService.getSSOList(externalIds, ['id', 'name', 'color', 'photo', 'profession'] as any),
      this.services.userService.getLocalListByUserExternalId(externalIds, ['id', 'externalId'])
    ]);

    return transactions.map(item => {
      const ssoUser = ssoUsers.find(su => su.id === item.from?.externalId);
      const localUser = (localUsers as IUser[]).find(lu => lu.externalId === ssoUser?.id);

      const result = {
        txId: item.id,
        userId: localUser?.id,
        name: ssoUser?.name,
        photo: ssoUser?.photo,
        occupation: ssoUser?.profession,
        color: (ssoUser as any)?.color,
        amount: item.amount,
        type: CoinTransferTransactionTypeEnum.EGF
      } as any;

      return result;
    });
  }

  private async getTotalIncomingAmountToday(): Promise<number> {
    const currentDate = getUTCDateWithoutTime();

    const found: any = await this.services.coinTransferTransactionRepository.findAll({
      where: sequelize.where(sequelize.fn('date', sequelize.col('created_at')), '>=', currentDate.toISOString()),
      attributes: [[fn('sum', col('amount')), 'total']]
    });

    return found?.length ? found[0].total : 0;
  }
}

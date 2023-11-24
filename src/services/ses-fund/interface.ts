import { CoinTransferTransactionTypeEnum } from '../../database';

export interface ICoinTransferTransaction {
  userId: number;
  name: string;
  photo: string;
  occupation?: string;
  color?: string;
  type: CoinTransferTransactionTypeEnum;
  amount: number;
  metadata: string;
}

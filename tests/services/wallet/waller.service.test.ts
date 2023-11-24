import { IUser, WalletService } from '../../../src/services';
import { paymentClient } from '../../../src/clients';
import { CoinTransferTransactionRepository } from '../../../src/dal';
import { CoinTransferTransactionDbModel, CoinTransferTransactionTypeEnum } from '../../../src/database';
jest.mock('../../../src/clients');
enum TOKEN_URL_KEY_ENUM {
  FIAT = 'fiat',
  REWARD_TOKEN = 'reward_token',
  COIN_TOKEN = 'coin_token'
}

const walletInfo = {
  address: null,
  rewardToken: { amount: 0, totalIncome: 0 },
  coinToken: { amount: 0, totalIncome: 0 }
};

const rewardTokenTrx = {
  id: 1,
  status: 'rewardTokenTrx'
};

const coinTokenTrx = {
  id: 1,
  status: 'coinTokenTrx'
};

const externalId = 123;
const user = {
  id:1111,
  externalId
} as IUser;
const dataTransfer = [
  {
    id: 1,
    action: "COIN_USER_TRANSFER_MINT",
    amount: 15
  },
  {
    id: 2,
    action: "COIN_USER_TRANSFER_BURN",
    amount: 15
  }
];
describe('Unittest:Service:WalletService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await CoinTransferTransactionDbModel.destroy({
      where: { userId: user.id },
      force: true
    });
  });

  const coinTransferTransactionRepository = new CoinTransferTransactionRepository();
  describe('getWalletInfo', () => {
    it('should return wallet from payment', async () => {
      (paymentClient.retrieveWalletBalance as jest.Mock).mockResolvedValueOnce(walletInfo);
      const walletService = new WalletService({ coinTransferTransactionRepository });
      const result = await walletService.getWalletInfo(externalId);
      expect(result).toMatchObject(walletInfo);
    });

    it('should create and return wallet from payment', async () => {
      (paymentClient.retrieveWalletBalance as jest.Mock).mockRejectedValueOnce(new Error('error'));
      (paymentClient.createWallet as jest.Mock).mockResolvedValueOnce(walletInfo);
      const walletService = new WalletService({ coinTransferTransactionRepository });
      const result = await walletService.getWalletInfo(externalId);
      expect(result).toMatchObject(walletInfo);
    });

    it('should return default wallet when wallet from paymentClient is null', async () => {
      (paymentClient.retrieveWalletBalance as jest.Mock).mockResolvedValueOnce(null);
      const walletService = new WalletService({ coinTransferTransactionRepository });
      const result = await walletService.getWalletInfo(externalId);
      expect(result).toMatchObject(walletInfo);
    });

    it('should log error when paymentClient return error', async () => {
      (paymentClient.retrieveWalletBalance as jest.Mock).mockRejectedValueOnce(new Error('error'));
      (paymentClient.createWallet as jest.Mock).mockRejectedValueOnce(new Error('error'));
      const walletService = new WalletService({ coinTransferTransactionRepository });
      const result = await walletService.getWalletInfo(externalId);
      expect(result).toMatchObject(walletInfo);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return reward token transaction', async () => {
      (paymentClient.getRewardTokenTransactions as jest.Mock).mockResolvedValueOnce(rewardTokenTrx);
      const walletService = new WalletService({ coinTransferTransactionRepository });
      const result = await walletService.getTransactionHistory(TOKEN_URL_KEY_ENUM.REWARD_TOKEN, externalId);
      expect(result).toMatchObject(rewardTokenTrx);
    });

    it('should return coin token transaction', async () => {
      (paymentClient.getCoinTokenTransactions as jest.Mock).mockResolvedValueOnce(coinTokenTrx);
      const walletService = new WalletService({ coinTransferTransactionRepository });
      const result = await walletService.getTransactionHistory(TOKEN_URL_KEY_ENUM.COIN_TOKEN, externalId);
      expect(result).toMatchObject(coinTokenTrx);
    });

    it('should return empty array when type is incorrect', async () => {
      const walletService = new WalletService({ coinTransferTransactionRepository });
      const result = await walletService.getTransactionHistory('incorrectType', externalId);
      expect(result).toMatchObject([]);
    });
  });

  describe('coinTransferTransaction', () => {
    it('should return transfer transaction from payment', async () => {
      (paymentClient.transferCoinTokenToSeSFund as jest.Mock).mockResolvedValueOnce(dataTransfer);
      const walletService = new WalletService({ coinTransferTransactionRepository });
      await walletService.transferToSeSFund(user, {
        type: CoinTransferTransactionTypeEnum.EGF,
        amount: 15,
        metadata: "test"
      });
      const result = await coinTransferTransactionRepository.findOne( { where: { userId: user.id} }) as any;
      expect(result).not.toBeNull();
      expect(result.type).toBe(CoinTransferTransactionTypeEnum.EGF);
      expect(result.amount).toBe(dataTransfer[0].amount);
      expect(result.paymentServiceTxs.contributionBurnTx).not.toBeNull();
      expect(result.paymentServiceTxs.contributionMinTx).not.toBeNull();
    });
  });
});

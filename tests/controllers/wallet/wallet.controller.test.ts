import { IUser, WalletService } from '../../../src/services';
import { WalletController } from '../../../src/controllers';
import { CoinTransferTransactionRepository } from '../../../src/dal';
import { CoinTransferTransactionTypeEnum } from '../../../src/database';
jest.mock('../../../src/services');
const walletInfo = {
  address: null,
  rewardToken: { amount: 0, totalIncome: 0 },
  coinToken: { amount: 0, totalIncome: 0 }
};

const rewardTokenTrx = {
  id: 1,
  status: 'rewardTokenTrx'
};

const externalId = 123;
const user = {
  id:1111,
  externalId
} as IUser;
const dataTransfer = {
  id: 1,
  userId: user.id,
  type: CoinTransferTransactionTypeEnum.EGF,
  amount: 15,
  metadata: "test"
};
const wallet = {
  address: null,
  rewardToken: { amount: 0, totalIncome: 0 },
  coinToken: { amount: 100, totalIncome: 100 }
};
describe('Unittest:Controller:WalletController', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const coinTransferTransactionRepository = new CoinTransferTransactionRepository();
  describe('getWalletInfo', () => {
    it('should return wallet from payment', async () => {
      const walletService = new WalletService({ coinTransferTransactionRepository });
      (walletService.getWalletInfo as jest.Mock).mockResolvedValueOnce(walletInfo);
      const walletController = new WalletController({ walletService });
      const result = await walletController.getWalletInfo(1);
      expect(result).toMatchObject(walletInfo);
    });

    it('should return error when user do not have externalId', async () => {
      const walletService = new WalletService({ coinTransferTransactionRepository });
      (walletService.getWalletInfo as jest.Mock).mockResolvedValueOnce(walletInfo);
      const walletController = new WalletController({ walletService });
      const result = await walletController.getWalletInfo(0).catch(e => e);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction', async () => {
      const walletService = new WalletService({ coinTransferTransactionRepository });
      (walletService.getTransactionHistory as jest.Mock).mockResolvedValueOnce(rewardTokenTrx);
      const walletController = new WalletController({ walletService });
      const result = await walletController.getTransactionHistory('type', 1);
      expect(result).toMatchObject(rewardTokenTrx);
    });

    it('should return error when user do not have externalId', async () => {
      const walletService = new WalletService({ coinTransferTransactionRepository });
      (walletService.getTransactionHistory as jest.Mock).mockResolvedValueOnce(rewardTokenTrx);
      const walletController = new WalletController({ walletService });
      const result = await walletController.getTransactionHistory('type', 0).catch(e => e);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('coinTransferTransaction', () => {
    it('should return wallet from payment', async () => {
      const walletService = new WalletService({ coinTransferTransactionRepository });
      (walletService.transferToSeSFund as jest.Mock).mockResolvedValueOnce('default');
      (walletService.getWalletInfo as jest.Mock).mockResolvedValueOnce(wallet);
      const walletController = new WalletController({ walletService });
      const result = await walletController.transferToSeSFund(user, dataTransfer);
      expect(result).toBe(true);
    });
  });
});

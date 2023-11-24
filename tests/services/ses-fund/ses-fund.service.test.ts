import { SesFundService, UserService } from '../../../src/services';
import { CoinTransferTransactionRepository, ShopRepository, UserRepository } from '../../../src/dal';
import Logger from '@freewilltokyo/logger';
import { SimpleRequest, SSOClient, VibesClient } from '@freewilltokyo/freewill-be';
import config from '../../../src/config';
import { paymentClient } from '../../../src/clients';
jest.mock('../../../src/clients');

const mockBalanceInfo = {
  amount: 1000,
  totalContributedUsers: 10,
  totalIngoingAmount: {
    oldValue: 20549,
    newValue: 20549,
    interval: 86400
  },
  totalOutgoingAmount: 0
};

describe('Unittest:Service:SesFundService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const coinTransferTransactionRepository = new CoinTransferTransactionRepository();
  const userRepository = new UserRepository();
  const shopRepository = new ShopRepository();

  const ssoClientLogger = new Logger('SSOClient');
  const simpleRequestLogger = new Logger('SimpleRequest');

  const ssoClient = new SSOClient(new SimpleRequest('', { log: simpleRequestLogger }), { log: ssoClientLogger });
  const vibesClientLogger = new Logger('VibesClient');
  const vibesClient = new VibesClient(new SimpleRequest(config.get('vibes').apiUrl, { log: simpleRequestLogger }), {
    log: vibesClientLogger
  });

  const userService = new UserService({ vibesClient, ssoClient, userRepository, shopRepository });
  describe('Service:SesFund', () => {
    it('should return Total Balance result', async () => {
      (paymentClient.getSeSFundWalletBalance as jest.Mock).mockResolvedValueOnce(mockBalanceInfo);
      const sesFundService = new SesFundService({ coinTransferTransactionRepository, userService });
      const result = await sesFundService.getTotalIncomingAmount();
      expect(result).toBe(20549);
    });
  });
});

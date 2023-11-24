import {
  ShopRepository,
  CoinTransferTransactionRepository,
  UserRepository
} from '../../../src/dal';
import { SesFundService, UserService } from '../../../src/services';
import { SesFundController } from '../../../src/controllers';
import { SimpleRequest, SSOClient, VibesClient } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import config from '../../../src/config';

jest.mock('../../../src/services', () => {
  const mockData = {
    "count": 2,
    "data": [
        {
            "userId": 2,
            "amount": 9,
            "type": "EGF",
            "metadata": null,
            "name": "freewillhvn",
            "photo": "https://dev-spin-storage.s3.ap-northeast-1.amazonaws.com/public/files/users/247/photo/3491f0b0-eaf8-11ea-8a19-a91301548781.jpg",
            "occupation": ""
        },
        {
            "userId": 2,
            "amount": 1,
            "type": "EGF",
            "metadata": "test",
            "name": "freewillhvn",
            "photo": "https://dev-spin-storage.s3.ap-northeast-1.amazonaws.com/public/files/users/247/photo/3491f0b0-eaf8-11ea-8a19-a91301548781.jpg",
            "occupation": ""
        }
    ],
    "metadata": {
        "limit": 10,
        "pageNumber": 1,
        "total": 2,
        "totalPages": 1
    }
  };

  const mockCombinedUserData = {
    2: {
    id: 1,
    name: 'name',
    photo: 'photo',
    profession: 'profession'
  }};

  const sesFundService = {
    getAllCoinTransferTransactions: jest.fn(() => Promise.resolve(mockData)),
    getTotalIncomingAmount: jest.fn(() => Promise.resolve(2000))
  };

  const userService = {
    getCombinedList: jest.fn(() => Promise.resolve(mockCombinedUserData))
  };

  return {
    SesFundService: jest.fn(() => sesFundService),
    UserService: jest.fn(() => userService)
  };
});

jest.mock('../../../src/dal', () => {

  return {
    CoinTransferTransactionRepository: jest.fn(),
    UserRepository: jest.fn(),
    ShopRepository: jest.fn()
  };
});

describe('Controller:SesFund', () => {
  describe('Test Controller:SesFund', () => {

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

    const sesFundService = new SesFundService({
      coinTransferTransactionRepository,
      userService
    });
    const sesFundController = new SesFundController({ sesFundService });
    const pagination = {
      limit: 10,
      pageNumber: 1
    };
    describe('GetAllCoinTransfers: Check total number of CoinTransfer', () => {
      it('should return total count is 2', async () => {
        const result = await sesFundController.getAllCoinTransferTransactions(pagination) as any;
        expect(result.count).toBe(2);
      });
    });

    describe('GetAllCoinTransfers:Check length result', () => {
      it('should return 2', async () => {
        const result = await sesFundController.getAllCoinTransferTransactions(pagination) as any;
        expect(result.data.length).toBe(2);
      });
    });

    describe('GetTotalBalance:Get Total Balance result', () => {
      it('should return 2000', async () => {
        const result = await sesFundController.getTotalIncomingAmount();
        expect(result).toBe(2000);
      });
    });
  });
});

import { OrderingItemsRepository, ConfigRepository } from '../../../src/dal';
import { OrderingItemsService } from '../../../src/services';

const mockData = [{
  id: 2,
  userId: 1,
  orderId: 1,
  paymentIntentId: 'pk_fpiejwifjwe03r3r',
  productId: 1234,
  productNameId: 'Japan',
  pattern: 123,
  color: 321,
  customParameter: 231,
  quantity: 1,
  createdAt: '2021-04-13T08:16:44.000Z',
  updatedAt: '2021-04-13T08:46:50.000Z'
}];

jest.mock('../../../src/dal', () => {
  const orderingItemsRepository = {
    bulkCreate: jest.fn(() => Promise.resolve(mockData))
  };

  const configRepository = {
    getProductOrderManagementInterval: jest.fn(() => Promise.resolve(300))
  };

  return {
    OrderingItemsRepository: jest.fn(() => orderingItemsRepository),
    ConfigRepository: jest.fn(() => configRepository)
  };
});

describe('Unitest:Service:OrderingItem:Create', () => {
  describe('OrderingItem:Create', () => {
    const orderingItemsRepository = new OrderingItemsRepository();
    const configRepository = new ConfigRepository();
    const orderingItemsService = new OrderingItemsService({ orderingItemsRepository, configRepository });
    
    const mockOrderingItems = [{
      id: 2,
      userId: 1,
      orderId: 1,
      paymentIntentId: 'pk_fpiejwifjwe03r3r',
      productId: 1234,
      productNameId: 'Japan',
      pattern: 123,
      color: 321,
      customParameter: 231,
      quantity: 1,
      createdAt: '2021-04-13T08:16:44.000Z',
      updatedAt: '2021-04-13T08:46:50.000Z'
    }];

    describe('Create:Check return result', () => {
      it('should return equal the mock data', async () => {
        const result = await orderingItemsService.bulkCreate(mockOrderingItems);
        expect(result[0].userId).toBe(mockData[0].userId);
        expect(result[0].orderId).toBe(mockData[0].orderId);
        expect(result[0].paymentIntentId).toBe(mockData[0].paymentIntentId);
        expect(result[0].productId).toBe(mockData[0].productId);
        expect(result[0].productNameId).toBe(mockData[0].productNameId);
        expect(result[0].pattern).toBe(mockData[0].pattern);
        expect(result[0].color).toBe(mockData[0].color);
        expect(result[0].customParameter).toBe(mockData[0].customParameter);
        expect(result[0].quantity).toBe(mockData[0].quantity);
      });
    });
  });
});

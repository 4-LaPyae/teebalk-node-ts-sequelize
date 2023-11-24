import { OrderingItemsRepository, ConfigRepository } from '../../../src/dal';
import { OrderingItemsService } from '../../../src/services';

jest.mock('../../../src/dal', () => {
  const orderingItemsRepository = {
    delete: jest.fn(() => Promise.resolve())
  };

  const configRepository = {
    getProductOrderManagementInterval: jest.fn(() => Promise.resolve(300))
  };

  return {
    OrderingItemsRepository: jest.fn(() => orderingItemsRepository),
    ConfigRepository: jest.fn(() => configRepository)
  };
});

describe('Unitest:Service:OrderingItem:Delete', () => {
  describe('OrderingItem:Delete', () => {
    const orderingItemsRepository = new OrderingItemsRepository();
    const configRepository = new ConfigRepository();
    const orderingItemsService = new OrderingItemsService({ orderingItemsRepository, configRepository });

    describe('Delete:Check return result', () => {
      it('should return true', async () => {
        const result = await orderingItemsService.deleteByUserId(1);
        expect(result).toBe(true);
      });
    });
  });
});

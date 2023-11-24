import { ProductShippingFeesRepository, ProductRegionalShippingFeesRepository } from '../../../src/dal';
import { ProductShippingFeesService } from '../../../src/services';

const mockShippingFeeRange = {
  id: 1,
  productId: 1,
  quantityFrom: 1,
  quantityTo: 5,
  shippingFee: 100,
  overseasShippingFee: 100,
  createdAt: '2021-03-10T11:43:54.000Z',
  updatedAt: '2021-03-10T11:43:54.000Z',
  deletedAt: '2021-03-10T11:43:54.000Z',
};

const mockData = [{
  id: 0,
  productId: 1,
  quantityFrom: 1,
  quantityTo: 5,
  shippingFee: 100,
  overseasShippingFee: 100,
  regionalShippingFees: [],
  createdAt: '2021-03-10T11:43:54.000Z',
  updatedAt: '2021-03-10T11:43:54.000Z',
  deletedAt: '2021-03-10T11:43:54.000Z',
}];

jest.mock('../../../src/dal', () => {
  const productShippingFeesRepository = {
    create: jest.fn(() => Promise.resolve(mockShippingFeeRange))
  };

  const productRegionalShippingFeesRepository = {
    bulkCreate: jest.fn(() => Promise.resolve())
  };

  return {
    ProductShippingFeesRepository: jest.fn(() => productShippingFeesRepository),
    ProductRegionalShippingFeesRepository: jest.fn(() => productRegionalShippingFeesRepository)
  };
});

describe('Service:ProductShippingFees:BulkCreate', () => {
  describe('ProductShippingFees:BulkCreate', () => {
    const productShippingFeesRepository = new ProductShippingFeesRepository();
    const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();
    const productShippingFeesService = new ProductShippingFeesService({ productShippingFeesRepository, productRegionalShippingFeesRepository });

    describe('BulkCreate: Check created product shipping fees ranges', () => {
      it('should return nothing', async () => {
        const result = await productShippingFeesService.bulkCreate(1, mockData);
        expect(result[0]).toBe(undefined);
      });
    });
  });
});

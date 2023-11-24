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

jest.mock('../../../src/dal', () => {
  const productShippingFeesRepository = {
    update: jest.fn(() => Promise.resolve(mockShippingFeeRange)),
    delete: jest.fn(() => Promise.resolve())
  };

  const productRegionalShippingFeesRepository = {
    update: jest.fn(() => Promise.resolve(mockShippingFeeRange)),
    delete: jest.fn(() => Promise.resolve())
  };

  return {
    ProductShippingFeesRepository: jest.fn(() => productShippingFeesRepository),
    ProductRegionalShippingFeesRepository: jest.fn(() => productRegionalShippingFeesRepository)
  };
});

describe('Service:ProductShippingFees:Update', () => {
  describe('ProductShippingFees:Update', () => {
    const productShippingFeesRepository = new ProductShippingFeesRepository();
    const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();
    const productShippingFeesService = new ProductShippingFeesService({ productShippingFeesRepository, productRegionalShippingFeesRepository });

    describe('Update: Check updated product shipping fees ranges', () => {
      it('should return nothing', async () => {
        const data = [
          {
            id: 1,
            productId: 1,
            quantityFrom: 1,
            quantityTo: 5,
            shippingFee: 100,
            overseasShippingFee: 100,
            createdAt: '2021-03-10T11:43:54.000Z',
            updatedAt: '2021-03-10T11:43:54.000Z',
            deletedAt: '2021-03-10T11:43:54.000Z',
          }
        ];
        await productShippingFeesService.updateByProductId(1, data);
      });
    });
  });
});

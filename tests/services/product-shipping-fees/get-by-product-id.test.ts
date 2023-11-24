import { ProductShippingFeesRepository, ProductRegionalShippingFeesRepository } from '../../../src/dal';
import { ProductShippingFeesService } from '../../../src/services';

const mockShippingFeeRange = [{
  id: 1,
  productId: 1,
  quantityFrom: 1,
  quantityTo: 5,
  shippingFee: 100,
  overseasShippingFee: 100,
  regionalShippingFees: [],
}];

jest.mock('../../../src/dal', () => {
  const productShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve(mockShippingFeeRange)),
  };

  const productRegionalShippingFeesRepository = {
    findAll: jest.fn(() => Promise.resolve([]))
  };

  return {
    ProductShippingFeesRepository: jest.fn(() => productShippingFeesRepository),
    ProductRegionalShippingFeesRepository: jest.fn(() => productRegionalShippingFeesRepository)
  };
});

describe('Service:ProductShippingFees:getByProductId', () => {
  describe('ProductShippingFees:getByProductId', () => {
    const productShippingFeesRepository = new ProductShippingFeesRepository();
    const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();
    const productShippingFeesService = new ProductShippingFeesService({ productShippingFeesRepository, productRegionalShippingFeesRepository });

    describe('getByProductId: Check result product shipping fees ranges', () => {
      it('should return array of existing product shipping fees ranges', async () => {
        const result = await productShippingFeesService.getByProductId(1);
        expect(result[0].id).toEqual(1),
        expect(result[0].productId).toEqual(1),
        expect(result[0].quantityFrom).toEqual(1),
        expect(result[0].quantityTo).toEqual(5),
        expect(result[0].shippingFee).toEqual(100),
        expect(result[0].overseasShippingFee).toEqual(100)
      });
    });
  });
});

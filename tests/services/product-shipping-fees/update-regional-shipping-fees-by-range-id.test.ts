import { ProductShippingFeesRepository, ProductRegionalShippingFeesRepository } from '../../../src/dal';
import { IProductRegionalShippingFeesModel } from '../../../src/database';
import { ProductShippingFeesService } from '../../../src/services';

const mockData = {
  id: 1,
  productId: 1,
  prefectureCode: 'JP-47',
  shippingFee: 100,
  quantityRangeId: 1
} as IProductRegionalShippingFeesModel

const mockResult = {
  id: 1,
  productId: 1,
  prefectureCode: 'JP-47',
  shippingFee: 100,
  quantityRangeId: 1
} as IProductRegionalShippingFeesModel;

jest.mock('../../../src/dal', () => {
  const productRegionalShippingFeesRepository = {
    update: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductShippingFeesRepository: jest.fn(() => Promise.resolve),
    ProductRegionalShippingFeesRepository: jest.fn(() => productRegionalShippingFeesRepository)
  };
});

describe('Service:ProductShippingFees:Update', () => {
  describe('ProductShippingFees:Update', () => {
    const productShippingFeesRepository = new ProductShippingFeesRepository();
    const productRegionalShippingFeesRepository = new ProductRegionalShippingFeesRepository();
    const productShippingFeesService = new ProductShippingFeesService({ productShippingFeesRepository, productRegionalShippingFeesRepository });

    describe('BulkCreate: Check created product shipping fees ranges', () => {
      it('should return nothing', async () => {
        const result = await productShippingFeesService.updateRegionalShippingFeeById(1, 1, mockData);
        expect(result).toStrictEqual(mockResult);
      });
    });
  });
});

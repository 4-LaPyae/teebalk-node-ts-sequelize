import { ProductCategoryRepository } from '../../../src/dal';
import { IProductCategoryModel } from '../../../src/database';
import { ProductCategoryService } from '../../../src/services';

const mockData = {
  id: 1,
  productId: 1,
  categoryId: 1,
  updatedAt: '2021-03-19T06:39:54.163Z',
  createdAt: '2021-03-19T06:39:54.163Z'
} as IProductCategoryModel;

jest.mock('../../../src/dal', () => {
  const productCategoryRepository = {
    create: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductCategoryRepository: jest.fn(() => productCategoryRepository)
  };
});

describe('Service:ProductCategory:Create', () => {
  describe('ProductCategory:Create', () => {
    const productCategoryRepository = new ProductCategoryRepository();
    const productCategoryService = new ProductCategoryService({ productCategoryRepository });
    describe('Create: Check created product category item', () => {
      it('should return created product category item', async () => {
        const result = await productCategoryService.create(1, 1);
        expect(result).toBe(mockData);
      });
    });
  });
});

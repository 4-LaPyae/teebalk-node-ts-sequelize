import { ProductCategoryRepository } from '../../../src/dal';
import { ProductCategoryService } from '../../../src/services';

const mockUpdateData = [null, 1];
const mockfindOneData = {
  id: 1,
  categoryId: 1,
  productId: 1,
  createdAt: '',
  updatedAt: ''
};

jest.mock('../../../src/dal', () => {
  const productCategoryRepository = {
    update: jest.fn(() => Promise.resolve(mockUpdateData)),
    findOne: jest.fn(() => Promise.resolve(mockfindOneData)),
    delete: jest.fn(),
    create: jest.fn(() => Promise.resolve(mockfindOneData))
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
        await productCategoryService.updateByProductId(1, 1);
        expect(productCategoryRepository.update).toBeCalled();
      });
    });

    describe('Create: Check created product category item', () => {
      it('should return created product category item', async () => {
        await productCategoryService.updateByProductId(1, 0);
        expect(productCategoryRepository.delete).toBeCalled();
      });
    });

    describe('Create: Check created product category item', () => {
      it('should return created product category item', async () => {
        productCategoryRepository.findOne = jest.fn(() => Promise.resolve(undefined as any));
        await productCategoryService.updateByProductId(1, 1);
        expect(productCategoryRepository.create).toBeCalled();
      });
    });
  });
});

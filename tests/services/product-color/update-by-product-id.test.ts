import { LanguageEnum } from '../../../src/constants';
import { ProductColorRepository } from '../../../src/dal';
import { IProductColorModel } from '../../../src/database';
import { ProductColorService } from '../../../src/services';

const mockUpdateData = [null, 1];
const mockfindOneData = {
  id: 1,
  categoryId: 1,
  productId: 1,
  createdAt: '',
  updatedAt: ''
};

jest.mock('../../../src/dal', () => {
  const productColorRepository = {
    update: jest.fn(() => Promise.resolve(mockUpdateData)),
    delete: jest.fn(),
    create: jest.fn(() => Promise.resolve(mockfindOneData)),
    bulkCreate: jest.fn()
  };

  return {
    ProductColorRepository: jest.fn(() => productColorRepository)
  };
});

describe('Service:ProductColor:UpdateByProductId', () => {
  describe('ProductColor:UpdateByProductId', () => {
    const productColorRepository = new ProductColorRepository();
    const productColorService = new ProductColorService({ productColorRepository });

    const mockData = [
      {
        id: 1,
        productId: 1,
        color: 'Red',
        displayPosition: 1,
        isOrigin: true,
        language: LanguageEnum.ENGLISH
      },
      {
        id: 2,
        productId: 1,
        color: 'Blue',
        displayPosition: 2,
        isOrigin: true,
        language: LanguageEnum.ENGLISH
      },
      {
        id: 3,
        productId: 1,
        color: 'Green',
        displayPosition: 3,
        isOrigin: true,
        language: LanguageEnum.ENGLISH
      }
    ] as IProductColorModel[];
    describe('UpdateByProductId: Check created product category item', () => {
      it('should return created product category item', async () => {
        await productColorService.updateByProductId(1, mockData);
        expect(productColorRepository.update).toBeCalled();
      });
    });

    describe('Create: Check created product category item', () => {
      it('should return created product category item', async () => {
        await productColorService.updateByProductId(1, mockData);
        expect(productColorRepository.delete).toBeCalled();
      });
    });

    describe('Create: Check created product category item', () => {
      it('should return created product category item', async () => {
        const mockData = [
          {
            productId: 1,
            color: 'Red',
            displayPosition: 1,
            isOrigin: true,
            language: LanguageEnum.ENGLISH
          }
        ] as IProductColorModel[];
        await productColorService.updateByProductId(1, mockData);
        expect(productColorRepository.bulkCreate).toBeCalled();
      });
    });
  });
});

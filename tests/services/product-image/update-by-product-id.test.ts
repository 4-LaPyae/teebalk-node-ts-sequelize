import { LanguageEnum } from '../../../src/constants';
import { ProductImageRepository } from '../../../src/dal';
import { IProductImageModel } from '../../../src/database';
import { ProductImageService } from '../../../src/services';

const mockUpdateData = [null, 1];

jest.mock('../../../src/dal', () => {
  const productImageRepository = {
    update: jest.fn(() => Promise.resolve(mockUpdateData)),
    delete: jest.fn(),
    create: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn()
  };

  return {
    ProductImageRepository: jest.fn(() => productImageRepository)
  };
});

describe('Service:ProductImage:UpdateByProductId', () => {
  describe('ProductImage:UpdateByProductId', () => {
    const productImageRepository = new ProductImageRepository();
    const productImageService = new ProductImageService({ productImageRepository });

    const mockData = [
      {
        id: 1,
        productId: 1,
        imagePath: 'string',
        isOrigin: true,
        language: LanguageEnum.ENGLISH
      },
      {
        id: 2,
        productId: 1,
        imagePath: 'string',
        isOrigin: true,
        language: LanguageEnum.ENGLISH
      },
      {
        id: 3,
        productId: 1,
        imagePath: 'string',
        isOrigin: true,
        language: LanguageEnum.ENGLISH
      }
    ] as IProductImageModel[];
    describe('UpdateByProductId: Check created product image item', () => {
      it('should return created product image item', async () => {
        await productImageService.updateByProductId(1, mockData);
        expect(productImageRepository.update).toBeCalled();
      });
    });

    describe('Create: Check created product image item', () => {
      it('should return created product image item', async () => {
        await productImageService.updateByProductId(1, mockData);
        expect(productImageRepository.delete).toBeCalled();
      });
    });

    describe('Create: Check created product image item', () => {
      it('should return created product image item', async () => {
        const mockData = [
          {
            productId: 1,
            imagePath: 'string',
            isOrigin: true,
            language: LanguageEnum.ENGLISH
          }
        ] as IProductImageModel[];
        await productImageService.updateByProductId(1, mockData);
        expect(productImageRepository.bulkCreate).toBeCalled();
      });
    });
  });
});

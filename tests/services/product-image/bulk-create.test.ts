import { LanguageEnum } from '../../../src/constants';
import { ProductImageRepository } from '../../../src/dal';
import { IProductImageModel } from '../../../src/database';
import { ProductImageService } from '../../../src/services';

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

jest.mock('../../../src/dal', () => {
  const productImageRepository = {
    bulkCreate: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductImageRepository: jest.fn(() => productImageRepository)
  };
});

describe('Service:ProductImage:BulkCreate', () => {
  describe('ProductImage:BulkCreate', () => {
    const productImageRepository = new ProductImageRepository();
    const productImageService = new ProductImageService({ productImageRepository });

    describe('BulkCreate: Check created product image items', () => {
      it('should return array of created product image items', async () => {
        const mockImagesData: any[] = [
          {
            imagePath: 'string',
            isOrigin: true
          },
          {
            imagePath: 'string',
            isOrigin: true
          },
          {
            imagePath: 'string',
            isOrigin: true
          }
        ];
        const result = await productImageService.bulkCreate(1, mockImagesData);
        expect(result).toBe(mockData);
      });
    });
  });
});

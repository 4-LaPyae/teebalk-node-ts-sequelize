import { LanguageEnum } from '../../../src/constants';
import { ProductColorRepository } from '../../../src/dal';
import { IProductColorModel } from '../../../src/database';
import { ProductColorService } from '../../../src/services';

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

jest.mock('../../../src/dal', () => {
  const productColorRepository = {
    bulkCreate: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductColorRepository: jest.fn(() => productColorRepository)
  };
});

describe('Service:ProductColor:BulkCreate', () => {
  describe('ProductColor:BulkCreate', () => {
    const productColorRepository = new ProductColorRepository();
    const productColorService = new ProductColorService({ productColorRepository });

    describe('BulkCreate: Check created product color items', () => {
      it('should return array of created product color items', async () => {
        const mockColorsData: any[] = [
          {
            color: 'Red',
            displayPosition: 1,
            isOrigin: true
          },
          {
            color: 'Blue',
            displayPosition: 2,
            isOrigin: true
          },
          {
            color: 'Green',
            displayPosition: 3,
            isOrigin: true
          }
        ];
        const result = await productColorService.bulkCreate(1, mockColorsData);
        expect(result).toBe(mockData);
      });
    });
  });
});

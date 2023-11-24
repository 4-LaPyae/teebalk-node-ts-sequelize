import { LanguageEnum } from '../../../src/constants';
import { ProductPatternRepository } from '../../../src/dal';
import { IProductPatternModel } from '../../../src/database';
import { ProductPatternService } from '../../../src/services';

const mockData = [
  {
    id: 1,
    productId: 1,
    pattern: 'Red',
    displayPosition: 1,
    isOrigin: true,
    language: LanguageEnum.ENGLISH
  },
  {
    id: 2,
    productId: 1,
    pattern: 'Blue',
    displayPosition: 2,
    isOrigin: true,
    language: LanguageEnum.ENGLISH
  },
  {
    id: 3,
    productId: 1,
    pattern: 'Green',
    displayPosition: 3,
    isOrigin: true,
    language: LanguageEnum.ENGLISH
  }
] as IProductPatternModel[];

jest.mock('../../../src/dal', () => {
  const productPatternRepository = {
    bulkCreate: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductPatternRepository: jest.fn(() => productPatternRepository)
  };
});

describe('Service:ProductPattern:BulkCreate', () => {
  describe('ProductPattern:BulkCreate', () => {
    const productPatternRepository = new ProductPatternRepository();
    const productPatternService = new ProductPatternService({ productPatternRepository });

    describe('BulkCreate: Check created product pattern items', () => {
      it('should return array of created product pattern items', async () => {
        const mockPatternsData: any[] = [
          {
            pattern: 'Red',
            displayPosition: 1,
            isOrigin: true
          },
          {
            pattern: 'Blue',
            displayPosition: 2,
            isOrigin: true
          },
          {
            pattern: 'Green',
            displayPosition: 3,
            isOrigin: true
          }
        ];
        const result = await productPatternService.bulkCreate(1, mockPatternsData);
        expect(result).toBe(mockData);
      });
    });
  });
});

import { LanguageEnum } from '../../../src/constants';
import { ProductCustomParameterRepository } from '../../../src/dal';
import { IProductCustomParameterModel } from '../../../src/database';
import { ProductCustomParameterService } from '../../../src/services';

const mockData = [
  {
    id: 1,
    productId: 1,
    customParameter: 'Red',
    displayPosition: 1,
    isOrigin: true,
    language: LanguageEnum.ENGLISH
  },
  {
    id: 2,
    productId: 1,
    customParameter: 'Blue',
    displayPosition: 2,
    isOrigin: true,
    language: LanguageEnum.ENGLISH
  },
  {
    id: 3,
    productId: 1,
    customParameter: 'Green',
    displayPosition: 3,
    isOrigin: true,
    language: LanguageEnum.ENGLISH
  }
] as IProductCustomParameterModel[];

jest.mock('../../../src/dal', () => {
  const productCustomParameterRepository = {
    bulkCreate: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductCustomParameterRepository: jest.fn(() => productCustomParameterRepository)
  };
});

describe('Service:ProductCustomParameter:BulkCreate', () => {
  describe('ProductCustomParameter:BulkCreate', () => {
    const productCustomParameterRepository = new ProductCustomParameterRepository();
    const productCustomParameterService = new ProductCustomParameterService({ productCustomParameterRepository });

    describe('BulkCreate: Check created product CustomParameter items', () => {
      it('should return array of created product CustomParameter items', async () => {
        const mockCustomParametersData: any[] = [
          {
            customParameter: 'Red',
            displayPosition: 1,
            isOrigin: true
          },
          {
            customParameter: 'Blue',
            displayPosition: 2,
            isOrigin: true
          },
          {
            customParameter: 'Green',
            displayPosition: 3,
            isOrigin: true
          }
        ];
        const result = await productCustomParameterService.bulkCreate(1, mockCustomParametersData);
        expect(result).toBe(mockData);
      });
    });
  });
});

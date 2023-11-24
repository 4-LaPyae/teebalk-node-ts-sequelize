import { LanguageEnum } from '../../../src/constants';
import { ProductMaterialRepository } from '../../../src/dal';
import { IProductMaterialModel } from '../../../src/database';
import { ProductMaterialService } from '../../../src/services';

const mockData = [
  {
    id: 1,
    productId: 1,
    material: 'string',
    percent: 50,
    displayPosition: 1,
    isOrigin: true,
    language: LanguageEnum.ENGLISH
  },
  {
    id: 2,
    productId: 1,
    material: 'string',
    percent: 30,
    displayPosition: 1,
    isOrigin: true,
    language: LanguageEnum.ENGLISH
  },
  {
    id: 3,
    productId: 1,
    material: 'string',
    percent: 20,
    displayPosition: 1,
    isOrigin: true,
    language: LanguageEnum.ENGLISH
  }
] as IProductMaterialModel[];

jest.mock('../../../src/dal', () => {
  const productMaterialRepository = {
    bulkCreate: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductMaterialRepository: jest.fn(() => productMaterialRepository)
  };
});

describe('Service:ProductMaterial:BulkCreate', () => {
  describe('ProductMaterial:BulkCreate', () => {
    const productMaterialRepository = new ProductMaterialRepository();
    const productMaterialService = new ProductMaterialService({ productMaterialRepository });

    describe('BulkCreate: Check created product material items', () => {
      it('should return array of created product material items', async () => {
        const mockMaterialsData: any[] = [
          {
            material: 'string',
            percent: 50
          },
          {
            material: 'string',
            percent: 30
          },
          {
            material: 'string',
            percent: 20
          }
        ];
        const result = await productMaterialService.bulkCreate(1, mockMaterialsData);
        expect(result).toBe(mockData);
      });
    });
  });
});

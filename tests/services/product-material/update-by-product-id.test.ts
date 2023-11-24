import { LanguageEnum } from '../../../src/constants';
import { ProductMaterialRepository } from '../../../src/dal';
import { IProductMaterialModel } from '../../../src/database';
import { ProductMaterialService } from '../../../src/services';

const mockUpdateData = [null, 1];

jest.mock('../../../src/dal', () => {
  const productMaterialRepository = {
    update: jest.fn(() => Promise.resolve(mockUpdateData)),
    delete: jest.fn(),
    create: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn()
  };

  return {
    ProductMaterialRepository: jest.fn(() => productMaterialRepository)
  };
});

describe('Service:ProductMaterial:UpdateByProductId', () => {
  describe('ProductMaterial:UpdateByProductId', () => {
    const productMaterialRepository = new ProductMaterialRepository();
    const productMaterialService = new ProductMaterialService({ productMaterialRepository });

    const mockData = [
      {
        id: 1,
        productId: 1,
        material: 'string',
        percent: 20,
        displayPosition: 1,
        isOrigin: true,
        language: LanguageEnum.ENGLISH
      },
      {
        id: 2,
        productId: 1,
        material: 'string',
        percent: 20,
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
    describe('UpdateByProductId: Check created product Material item', () => {
      it('should return created product Material item', async () => {
        await productMaterialService.updateByProductId(1, mockData);
        expect(productMaterialRepository.update).toBeCalled();
      });
    });

    describe('Create: Check created product Material item', () => {
      it('should return created product Material item', async () => {
        await productMaterialService.updateByProductId(1, mockData);
        expect(productMaterialRepository.delete).toBeCalled();
      });
    });

    describe('Create: Check created product Material item', () => {
      it('should return created product Material item', async () => {
        const mockData = [
          {
            productId: 1,
            material: 'string',
            percent: 20,
            displayPosition: 1,
            isOrigin: true,
            language: LanguageEnum.ENGLISH
          }
        ] as IProductMaterialModel[];
        await productMaterialService.updateByProductId(1, mockData);
        expect(productMaterialRepository.bulkCreate).toBeCalled();
      });
    });
  });
});

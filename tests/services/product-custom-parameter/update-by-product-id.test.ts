import { LanguageEnum } from '../../../src/constants';
import { ProductPatternRepository } from '../../../src/dal';
import { IProductPatternModel } from '../../../src/database';
import { ProductPatternService } from '../../../src/services';

const mockUpdateData = [null, 1];
jest.mock('../../../src/dal', () => {
  const productPatternRepository = {
    update: jest.fn(() => Promise.resolve(mockUpdateData)),
    delete: jest.fn(),
    create: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn()
  };

  return {
    ProductPatternRepository: jest.fn(() => productPatternRepository)
  };
});

describe('Service:ProductPattern:UpdateByProductId', () => {
  describe('ProductPattern:UpdateByProductId', () => {
    const productPatternRepository = new ProductPatternRepository();
    const productPatternService = new ProductPatternService({ productPatternRepository });

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
    describe('UpdateByProductId: Check created product pattern item', () => {
      it('should return created product pattern item', async () => {
        await productPatternService.updateByProductId(1, mockData);
        expect(productPatternRepository.update).toBeCalled();
      });
    });

    describe('Create: Check created product pattern item', () => {
      it('should return created product pattern item', async () => {
        await productPatternService.updateByProductId(1, mockData);
        expect(productPatternRepository.delete).toBeCalled();
      });
    });

    describe('Create: Check created product pattern item', () => {
      it('should return created product pattern item', async () => {
        const mockData = [
          {
            productId: 1,
            pattern: 'Red',
            displayPosition: 1,
            isOrigin: true,
            language: LanguageEnum.ENGLISH
          }
        ] as IProductPatternModel[];
        await productPatternService.updateByProductId(1, mockData);
        expect(productPatternRepository.bulkCreate).toBeCalled();
      });
    });
  });
});

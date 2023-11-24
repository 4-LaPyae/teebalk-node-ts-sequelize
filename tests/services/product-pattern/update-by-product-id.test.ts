import { LanguageEnum } from '../../../src/constants';
import { ProductCustomParameterRepository } from '../../../src/dal';
import { IProductCustomParameterModel } from '../../../src/database';
import { ProductCustomParameterService } from '../../../src/services';

const mockUpdateData = [null, 1];

jest.mock('../../../src/dal', () => {
  const productCustomParameterRepository = {
    update: jest.fn(() => Promise.resolve(mockUpdateData)),
    delete: jest.fn(),
    create: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn()
  };

  return {
    ProductCustomParameterRepository: jest.fn(() => productCustomParameterRepository)
  };
});

describe('Service:ProductCustomParameter:UpdateByProductId', () => {
  describe('ProductCustomParameter:UpdateByProductId', () => {
    const productCustomParameterRepository = new ProductCustomParameterRepository();
    const productCustomParameterService = new ProductCustomParameterService({ productCustomParameterRepository });

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
    describe('UpdateByProductId: Check created product customParameter item', () => {
      it('should return created product customParameter item', async () => {
        await productCustomParameterService.updateByProductId(1, mockData);
        expect(productCustomParameterRepository.update).toBeCalled();
      });
    });

    describe('Create: Check created product customParameter item', () => {
      it('should return created product customParameter item', async () => {
        await productCustomParameterService.updateByProductId(1, mockData);
        expect(productCustomParameterRepository.delete).toBeCalled();
      });
    });

    describe('Create: Check created product customParameter item', () => {
      it('should return created product customParameter item', async () => {
        const mockData = [
          {
            productId: 1,
            customParameter: 'Red',
            displayPosition: 1,
            isOrigin: true,
            language: LanguageEnum.ENGLISH
          }
        ] as IProductCustomParameterModel[];
        await productCustomParameterService.updateByProductId(1, mockData);
        expect(productCustomParameterRepository.bulkCreate).toBeCalled();
      });
    });
  });
});

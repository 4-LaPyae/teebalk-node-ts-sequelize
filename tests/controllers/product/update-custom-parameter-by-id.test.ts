import { ProductCustomParameterRepository } from '../../../src/dal';
import { ProductCustomParameterService } from '../../../src/services';
import { ProductController } from '../../../src/controllers';
import { IProductCustomParameterModel } from '../../../src/database';

const mockData = [
  {
    id: 1521,
    customParameter: "abc",
    displayPosition: 1,
    isOrigin: true,
    language: "en"
  },
  {
    id: 1522,
    customParameter: "abd",
    displayPosition: 2,
    isOrigin: true,
    language: "en"
  },
] as IProductCustomParameterModel[];

jest.mock('../../../src/services', () => {
  const productCustomParameterService = {
    updateByProductId: jest.fn(() => Promise.resolve()),
    getCustomParametersByProductId: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductCustomParameterService: jest.fn(() => productCustomParameterService)
  };
});

jest.mock('../../../src/dal', () => {
  return {
    ProductCustomParameterRepository: jest.fn()
  };
});

describe('Controller:UserShippingAddress:Update', () => {
  describe('UserShippingAddress:Update', () => {
    const productCustomParameterRepository = new ProductCustomParameterRepository();
    const productCustomParameterService = new ProductCustomParameterService({ productCustomParameterRepository });
    const productController = new ProductController({ productCustomParameterService });

    const mockCustomParameters = [
      {
        id: 1521,
        customParameter: "abc",
        displayPosition: 1,
        isOrigin: true,
        language: "en"
      },
      {
        customParameter: "abd",
        displayPosition: 2,
        isOrigin: true,
        language: "en"
      },
    ] as IProductCustomParameterModel[];

    describe('Update: Check return product custom parameters', () => {
      it('should return equal the mock data', async () => {
        const result = await productController.updateCustomParameters(1, mockCustomParameters);
        expect(result).toStrictEqual(mockData);
      });
    });

    describe('Update: Error missing productId', () => {
      it('should return ERROR message', async () => {
        try {
          await productController.updateCustomParameters(0, mockCustomParameters);
        } catch (error) {
          expect(error.message).toMatch('Parameter "productId" should not be empty');
        }
      });
    });
  });
});

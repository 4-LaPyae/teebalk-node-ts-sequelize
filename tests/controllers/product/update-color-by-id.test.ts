import { ProductColorRepository } from '../../../src/dal';
import { ProductColorService } from '../../../src/services';
import { ProductController } from '../../../src/controllers';
import { IProductColorModel } from '../../../src/database';

const mockData = [
  {
    id: 1521,
    color: "blue",
    displayPosition: 1,
    isOrigin: true,
    language: "en"
  },
  {
    id: 1522,
    color: "red",
    displayPosition: 2,
    isOrigin: true,
    language: "en"
  },
] as IProductColorModel[];

jest.mock('../../../src/services', () => {
  const productColorService = {
    updateByProductId: jest.fn(() => Promise.resolve()),
    getColorParametersByProductId: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductColorService: jest.fn(() => productColorService)
  };
});

jest.mock('../../../src/dal', () => {
  return {
    ProductColorRepository: jest.fn()
  };
});

describe('Controller:UserShippingAddress:Update', () => {
  describe('UserShippingAddress:Update', () => {
    const productColorRepository = new ProductColorRepository();
    const productColorService = new ProductColorService({ productColorRepository });
    const productController = new ProductController({ productColorService });

    const mockColorParameter = [
      {
        id: 1521,
        color: "blue",
        displayPosition: 1,
        isOrigin: true,
        language: "en"
      },
      {
        color: "red",
        displayPosition: 2,
        isOrigin: true,
        language: "en"
      }
    ] as IProductColorModel[];

    describe('Update: Check return product custom parameter', () => {
      it('should return equal the mock data', async () => {
        const result = await productController.updateColorParameters(1, mockColorParameter);
        expect(result).toStrictEqual(mockData);
      });
    });

    describe('Update: Error missing productId', () => {
      it('should return ERROR message', async () => {
        try {
          await productController.updateColorParameters(0, mockColorParameter);
        } catch (error) {
          expect(error.message).toMatch('Parameter "productId" should not be empty');
        }
      });
    });
  });
});

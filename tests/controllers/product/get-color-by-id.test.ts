import { ProductColorRepository } from '../../../src/dal';
import { ProductColorService } from '../../../src/services';
import { ProductController } from '../../../src/controllers';

const mockResult = [
  {
      id: 1,
      color: "red",
      displayPosition: 0,
      isOrigin: true,
      language: "en"
  }
]

const mockData = [
  {
      id: 1,
      color: "red",
      displayPosition: 0,
      isOrigin: true,
      language: "en"
  }
]

jest.mock('../../../src/services', () => {
  const productColorService = {
    getColorParametersByProductId: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductColorService: jest.fn(() => productColorService)
  };
});

jest.mock('../../../src/dal', () => {
  return {
    ProductColorRepository: jest.fn(),
  };
});

describe('Controller:ProductColor:getColorParametersByProductId', () => {
  describe('ProductColor:Get', () => {
    const productColorRepository = new ProductColorRepository();
    const productColorService = new ProductColorService({ productColorRepository });
    const productColorController = new ProductController({ productColorService });

    describe('Get: Check return color parameters', () => {
      it('should return equal the mock data', async () => {
        const result = await productColorController.getColorParameters(1);
        expect(result).toStrictEqual(mockResult);
      });
    });
  });
});
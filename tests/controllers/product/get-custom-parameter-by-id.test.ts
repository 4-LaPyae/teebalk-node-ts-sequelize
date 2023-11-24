import { ProductCustomParameterRepository } from '../../../src/dal';
import { ProductCustomParameterService } from '../../../src/services';
import { ProductController } from '../../../src/controllers';

const mockResult = [
  {
      id: 1,
      color: "abc",
      displayPosition: 0,
      isOrigin: true,
      language: "en"
  }
]

const mockData = [
  {
      id: 1,
      color: "abc",
      displayPosition: 0,
      isOrigin: true,
      language: "en"
  }
]

jest.mock('../../../src/services', () => {
  const productCustomParameterService = {
    getCustomParametersByProductId: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductCustomParameterService: jest.fn(() => productCustomParameterService)
  };
});

jest.mock('../../../src/dal', () => {
  return {
    ProductCustomParameterRepository: jest.fn(),
  };
});

describe('Controller:ProductCustomParameters:getColorParametersByProductId', () => {
  describe('ProductCustomParameters:Get', () => {
    const productCustomParameterRepository = new ProductCustomParameterRepository();
    const productCustomParameterService = new ProductCustomParameterService({ productCustomParameterRepository });
    const productCustomParametersController = new ProductController({ productCustomParameterService });

    describe('Get: Check return custom parameters', () => {
      it('should return equal the mock data', async () => {
        const result = await productCustomParametersController.getCustomParameters(1);
        expect(result).toStrictEqual(mockResult);
      });
    });
  });
});
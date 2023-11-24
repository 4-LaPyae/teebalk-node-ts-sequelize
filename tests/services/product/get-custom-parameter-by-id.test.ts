import { ProductCustomParameterRepository } from '../../../src/dal';
import { ProductCustomParameterService } from '../../../src/services';

const mockData = [
  {
      id: 1,
      customParameter: "abc",
      displayPosition: 0,
      isOrigin: true,
      language: "en"
  }
]

jest.mock('../../../src/dal', () => {
  const productCustomParameterRepository = {
    findAll: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductCustomParameterRepository: jest.fn(() => productCustomParameterRepository)
  };
});

describe('Unitest:Service:GetCustomParameters:Get', () => {
  describe('Find all custom parameters by product id', () => {
    const productCustomParameterRepository = new ProductCustomParameterRepository();
    const productCustomParameterService = new ProductCustomParameterService({ productCustomParameterRepository });

    describe('Get:Check return result', () => {
      it('should return equal the mock data', async () => {
        const result = await productCustomParameterService.getCustomParametersByProductId(1);
        expect(result[0].id).toBe(mockData[0].id);
        expect(result[0].customParameter).toBe(mockData[0].customParameter);
        expect(result[0].displayPosition).toBe(mockData[0].displayPosition);
        expect(result[0].isOrigin).toBe(mockData[0].isOrigin);
        expect(result[0].language).toBe(mockData[0].language);
      });
    });
  });
});

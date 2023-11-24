import { ProductColorRepository } from '../../../src/dal';
import { ProductColorService } from '../../../src/services';

const mockData = [
  {
      id: 1,
      color: "red",
      displayPosition: 0,
      isOrigin: true,
      language: "en"
  }
]

jest.mock('../../../src/dal', () => {
  const productColorRepository = {
    findAll: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductColorRepository: jest.fn(() => productColorRepository)
  };
});

describe('Unitest:Service:GetColorParameters:Get', () => {
  describe('Find all color parameters by product id', () => {
    const productColorRepository = new ProductColorRepository();
    const productColorService = new ProductColorService({ productColorRepository });

    describe('Get:Check return result', () => {
      it('should return equal the mock data', async () => {
        const result = await productColorService.getColorParametersByProductId(1);
        expect(result[0].id).toBe(mockData[0].id);
        expect(result[0].color).toBe(mockData[0].color);
        expect(result[0].displayPosition).toBe(mockData[0].displayPosition);
        expect(result[0].isOrigin).toBe(mockData[0].isOrigin);
        expect(result[0].language).toBe(mockData[0].language);
      });
    });
  });
});

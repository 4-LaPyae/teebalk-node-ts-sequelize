import { ProductCustomParameterRepository } from '../../../src/dal';
import { IProductCustomParameterModel } from '../../../src/database';
import { ProductCustomParameterService } from '../../../src/services';

jest.mock('../../../src/dal', () => {
  const productCustomParameterRepository = {
    update: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn(() => Promise.resolve())
  };

  return {
    ProductCustomParameterRepository: jest.fn(() => productCustomParameterRepository)
  };
});

describe('Unitest:Service:ProductCustomParameter:Update', () => {
  describe('ProductCustomParamter:Update', () => {
    const productCustomParameterRepository = new ProductCustomParameterRepository();
    const productCustomParameterService = new ProductCustomParameterService({ productCustomParameterRepository });

    const mockUpdate = [
      {
          id: 1,
          customParameter: "abc",
          displayPosition: 0,
          isOrigin: true,
          language: "en"
      }
    ] as IProductCustomParameterModel[];

    describe('Update:Check return result', () => {
      it('should return equal the mock data', async () => {
        const result = await productCustomParameterService.updateByProductId(1, mockUpdate);
        expect(result).toBe(undefined)
      });
    });
  });
});

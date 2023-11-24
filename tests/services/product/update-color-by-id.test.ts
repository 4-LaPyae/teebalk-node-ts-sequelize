import { ProductColorRepository } from '../../../src/dal';
import { IProductColorModel } from '../../../src/database';
import { ProductColorService } from '../../../src/services';

jest.mock('../../../src/dal', () => {
  const productColorRepository = {
    update: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
    bulkCreate: jest.fn(() => Promise.resolve())
  };

  return {
    ProductColorRepository: jest.fn(() => productColorRepository)
  };
});

describe('Unitest:Service:ProductColor:Update', () => {
  describe('ProductColor:Update', () => {
    const productColorRepository = new ProductColorRepository();
    const productColorService = new ProductColorService({ productColorRepository });

    const mockUpdate = [
      {
          id: 1,
          color: "red",
          displayPosition: 0,
          isOrigin: true,
          language: "en"
      }
    ] as IProductColorModel[];

    describe('Update:Check return result', () => {
      it('should return equal the mock data', async () => {
        const result = await productColorService.updateByProductId(1, mockUpdate);
        expect(result).toBe(undefined)
      });
    });
  });
});

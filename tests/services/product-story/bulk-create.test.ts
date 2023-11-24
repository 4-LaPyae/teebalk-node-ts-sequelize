import { LanguageEnum } from '../../../src/constants';
import { ProductStoryRepository } from '../../../src/dal';
import { IProductStoryModel } from '../../../src/database';
import { ProductStoryService } from '../../../src/services';

const mockData = {
  id: 1,
  productId: 1,
  content: 'string',
  plainTextContent: 'string',
  isOrigin: true,
  language: LanguageEnum.ENGLISH
} as IProductStoryModel;

jest.mock('../../../src/dal', () => {
  const productStoryRepository = {
    create: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductStoryRepository: jest.fn(() => productStoryRepository)
  };
});

describe('Service:ProductStory:BulkCreate', () => {
  describe('ProductStory:BulkCreate', () => {
    const productStoryRepository = new ProductStoryRepository();
    const productStoryService = new ProductStoryService({ productStoryRepository });

    describe('BulkCreate: Check created product story items', () => {
      it('should return array of created product story items', async () => {
        const mockStorysData: any = {
          content: 'string',
          plainTextContent: 'string',
          isOrigin: true
        };
        const result = await productStoryService.create(1, mockStorysData);
        expect(result).toBe(mockData);
      });
    });
  });
});

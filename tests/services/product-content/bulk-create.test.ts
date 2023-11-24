import { LanguageEnum } from '../../../src/constants';
import { ProductContentRepository } from '../../../src/dal';
import { IProductContentModel } from '../../../src/database';
import { ProductContentService } from '../../../src/services';

const mockData = {
  id: 1,
  productId: 1,
  title: 'string',
  subTitle: 'string',
  description: 'string',
  annotation: 'string',
  isOrigin: true,
  language: LanguageEnum.ENGLISH
} as IProductContentModel;

jest.mock('../../../src/dal', () => {
  const productContentRepository = {
    create: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductContentRepository: jest.fn(() => productContentRepository)
  };
});

describe('Service:ProductContent:Create', () => {
  describe('ProductContent:Create', () => {
    const productContentRepository = new ProductContentRepository();
    const productContentService = new ProductContentService({ productContentRepository });

    describe('Create: Check created product Content items', () => {
      it('should return array of created product Content items', async () => {
        const mockContentsData: any = {
          title: 'string',
          subTitle: 'string',
          description: 'string',
          annotation: 'string',
          isOrigin: true
        };
        const result = await productContentService.create(1, mockContentsData);
        expect(result).toBe(mockData);
      });
    });
  });
});

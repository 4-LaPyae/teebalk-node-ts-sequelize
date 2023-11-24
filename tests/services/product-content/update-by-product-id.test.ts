import { LanguageEnum } from '../../../src/constants';
import { ProductContentRepository } from '../../../src/dal';
import { IProductContentModel } from '../../../src/database';
import { ProductContentService } from '../../../src/services';

const mockUpdateData = [null, 1];
const mockData: IProductContentModel = {
  id: 1,
  productId: 1,
  title: 'string',
  subTitle: 'string',
  description: 'string',
  annotation: 'string',
  isOrigin: true,
  language: LanguageEnum.ENGLISH,
  createdAt: '',
  updatedAt: ''
};
jest.mock('../../../src/dal', () => {
  const productContentRepository = {
    update: jest.fn(() => Promise.resolve(mockUpdateData)),
    delete: jest.fn(),
    create: jest.fn(() => Promise.resolve()),
    findOne: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductContentRepository: jest.fn(() => productContentRepository)
  };
});

describe('Service:ProductContent:UpdateByProductId', () => {
  describe('ProductContent:UpdateByProductId', () => {
    const productContentRepository = new ProductContentRepository();
    const productContentService = new ProductContentService({ productContentRepository });

    const mockData: any = {
      id: 1,
      productId: 1,
      Content: 'Red',
      displayPosition: 1,
      isOrigin: true,
      language: LanguageEnum.ENGLISH
    };

    describe('UpdateByProductId: Check created product category item', () => {
      it('should return created product category item', async () => {
        await productContentService.updateByProductId(1, mockData);
        expect(productContentRepository.update).toBeCalled();
      });
    });

    describe('Create: Check created product category item', () => {
      it('should return created product category item', async () => {
        productContentRepository.findOne = jest.fn(() => Promise.resolve(null as any));
        await productContentService.updateByProductId(1, mockData);
        expect(productContentRepository.create).toBeCalled();
      });
    });
  });
});

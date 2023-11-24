import { LanguageEnum } from '../../../src/constants';
import { ProductStoryRepository } from '../../../src/dal';
import { IProductStoryModel } from '../../../src/database';
import { ProductStoryService } from '../../../src/services';

const mockUpdateData = [null, 1];
const mockData: any = {
  productId: 1,
  content: 'string',
  plainTextContent: 'string',
  isOrigin: true,
  language: LanguageEnum.ENGLISH
};

jest.mock('../../../src/dal', () => {
  const productStoryRepository = {
    update: jest.fn(() => Promise.resolve(mockUpdateData)),
    delete: jest.fn(),
    create: jest.fn(() => Promise.resolve()),
    findOne: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    ProductStoryRepository: jest.fn(() => productStoryRepository)
  };
});

describe('Service:ProductStory:UpdateByProductId', () => {
  describe('ProductStory:UpdateByProductId', () => {
    const productStoryRepository = new ProductStoryRepository();
    const productStoryService = new ProductStoryService({ productStoryRepository });

    const mockData = {
      id: 1,
      productId: 1,
      content: 'string',
      plainTextContent: 'string',
      isOrigin: true,
      language: LanguageEnum.ENGLISH
    } as IProductStoryModel;

    describe('UpdateByProductId: Check created product story item', () => {
      it('should return created product story item', async () => {
        await productStoryService.updateByProductId(1, mockData);
        expect(productStoryRepository.update).toBeCalled();
      });
    });

    describe('Create: Check created product story item', () => {
      it('should return created product story item', async () => {
        productStoryRepository.findOne = jest.fn(() => Promise.resolve(null as any));
        await productStoryService.updateByProductId(1, mockData);
        expect(productStoryRepository.create).toBeCalled();
      });
    });
  });
});

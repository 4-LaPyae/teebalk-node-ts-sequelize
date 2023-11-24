import {
  ShopAddressRepository,
  ShopContentRepository,
  ShopImageRepository,
  ShopRegionalShippingFeesRepository,
  ShopRepository,
  ShopShippingFeesRepository,
} from '../../../src/dal';
import { ShopRegionalShippingFeesService, ShopService, ShopShippingFeesService } from '../../../src/services';
import { ShopController } from '../../../src/controllers';
// import { ApiError } from '../../../src/errors';
//import { LanguageEnum } from '../../../src/constants';

const mockData = {
  "id": 5,
  "nameId": "ds4343sdf334",
  "userId": 5,
  "isFeatured": true,
  "platformPercents": 5,
  "status": "published",
  "publishedAt": "2021-06-16T06:08:17.000Z",
  "website": "http://exmaple.com",
  "email": "email@example.com",
  "phone": "0213456789",
  "createdAt": "2021-06-16T06:08:17.000Z",
  "updatedAt": "2021-09-21T11:38:03.000Z",
  "deletedAt": null,
  "images": [
    {
      "id": 3,
      "imagePath": "https://dev-tells-storage.s3.ap-northeast-1.amazonaws.com/public/Shop/images/18c68440-1ac7-11ec-8889-7d3e397604f511111",
      "imageDescription": null,
      "isOrigin": true,
      "language": "en"
    }
  ],
  "content": {
      "title": "shop 5",
      "subTitle": "Sub title",
      "description": "aaaaa",
      "policy": "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
      "isOrigin": true,
      "language": "en"
  }
};
jest.mock('../../../src/errors' , () => {
  return {
    ApiError: jest.fn()
  };
});
jest.mock('../../../src/services', () => {

  const ShopService = {
    getOneByNameId: jest.fn(() => Promise.resolve(mockData)),
  };

  const ShopShippingFeesService = {
    getByShopId: jest.fn(() => Promise.resolve([])),
  };

  return {
    ShopService: jest.fn(() => ShopService),
    ShopRegionalShippingFeesService: jest.fn(),
    ShopShippingFeesService: jest.fn(() => ShopShippingFeesService)
  };
});

jest.mock('../../../src/dal', () => {
  const ShopRepository = {
    getPublicOneByNameId: jest.fn(() => Promise.resolve(mockData))
  };
  return {
    ShopRepository: jest.fn(() => ShopRepository),
    ShopAddressRepository: jest.fn(),
    ShopContentRepository: jest.fn(),
    ShopImageRepository: jest.fn(),
    ShopRegionalShippingFeesRepository: jest.fn(),
    ShopShippingFeesRepository: jest.fn()
  };
});

describe('Controller:Shop:GetOneByNameId', () => {
  describe('Shop:GetOneByNameId', () => {
    const shopRepository = new ShopRepository();
    const shopAddressRepository = new ShopAddressRepository();
    const shopContentRepository = new ShopContentRepository();
    const shopImageRepository = new ShopImageRepository();
    const shopRegionalShippingFeesRepository = new ShopRegionalShippingFeesRepository();
    const shopShippingFeesRepository = new ShopShippingFeesRepository();
    const shopRegionalShippingFeesService = new ShopRegionalShippingFeesService({ shopRegionalShippingFeesRepository });
    const shopShippingFeesService = new ShopShippingFeesService({ shopRegionalShippingFeesRepository, shopShippingFeesRepository });
    const shopService = new ShopService({
      shopRepository,
      shopAddressRepository,
      shopContentRepository,
      shopImageRepository,
      shopShippingFeesService
    });
    const shopController = new ShopController({ shopService, shopRepository, shopRegionalShippingFeesService, shopShippingFeesService });
    const mockNameId = 'ds4343sdf334';


    describe('GetShopByNameId:Check name id of return Shop', () => {
      it('should return ds4343sdf334', async () => {
        const result = await shopController.getOneByNameId(mockNameId);
        expect(result.nameId).toBe(mockNameId);
      });
    });

  });
});

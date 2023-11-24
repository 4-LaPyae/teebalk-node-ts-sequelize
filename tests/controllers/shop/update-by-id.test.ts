import {
  ShopRepository,
  ShopContentRepository,
  ShopImageRepository,
  ShopAddressRepository,
  ShopRegionalShippingFeesRepository,
  ShopShippingFeesRepository
} from '../../../src/dal';
import { ShopRegionalShippingFeesService, ShopService, ShopShippingFeesService } from '../../../src/services';
import { ShopController } from '../../../src/controllers';
import { IShopModel, ShopStatusEnum } from '../../../src/database';
import { LanguageEnum } from '../../../src/constants';


jest.mock('../../../src/errors' , () => {
  return {
    ApiError: jest.fn()
  };
});

jest.mock('../../../src/dal', () => {
  const ShopRepository = {
    update: jest.fn(() => Promise.resolve())
  };
  const ShopAddressRepository = {
    updateByShopId: jest.fn(() => Promise.resolve())
  };
  const ShopContentRepository = {
    update: jest.fn(() => Promise.resolve())
  };
  const ShopImageRepository = {
    updateImagesByShopId: jest.fn(() => Promise.resolve())
  };
  return {
    ShopRepository: jest.fn(() => ShopRepository),
    ShopAddressRepository: jest.fn(() => ShopAddressRepository),
    ShopContentRepository: jest.fn(() => ShopContentRepository),
    ShopImageRepository: jest.fn(() => ShopImageRepository),
    ShopRegionalShippingFeesRepository: jest.fn(),
    ShopShippingFeesRepository: jest.fn()
  };
});

describe('Controller:Shop:Update', () => {
  describe('Shop:Update', () => {
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
    const shopController = new ShopController({ shopService, shopRepository, shopContentRepository, shopImageRepository, shopRegionalShippingFeesService, shopShippingFeesService});
    const mockUpdateData = {
      "title": "shop test 1",
      "website": "www.test.com",
      "email": "test@mail.com",
      "phone": "090534543534",
      "policy": "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
      "images": [
        {
          "id": 1,
          "shopId": 99999,
          "imagePath": "https://tells.s3.amazonaws.com/public/product/images/8945f120-1d0f-11ec-b0ac-d57959be0ce2",
          "imageDescription": '',
          "isOrigin": true,
          "language": LanguageEnum.ENGLISH,
          "createdAt": "2021-06-16T06:08:17.000Z",
          "updatedAt": "2021-09-24T08:15:39.000Z",
        }
      ],
      "address": {
        "id": 1,
        "shopId": 99999,
        "postalCode": '1234-5678',
        "country": '日本',
        "countryCode": 'JP',
        "state": '東京都',
        "stateCode": 'JP-47',
        "city": '港区',
        "addressLine1": '',
        "addressLine2": '',
        "isOrigin": true,
        "language": LanguageEnum.ENGLISH,
        "createdAt": "2021-06-16T06:08:17.000Z",
        "updatedAt": "2021-09-24T08:15:39.000Z",

      },
      "language": LanguageEnum.ENGLISH,
      "id": 99999,
      "nameId": '',
      "description": '',
      "status": ShopStatusEnum.PUBLISHED
    };
    const mockShopData: IShopModel = {
      "id": 99999,
      "nameId": "ds4343sdf334",
      "userId": 99999,
      "isFeatured": true,
      "platformPercents": 5,
      "experiencePlatformPercents": 5,
      "status": ShopStatusEnum.PUBLISHED,
      "publishedAt": "2021-06-16T06:08:17.000Z",
      "website": "www.test.com",
      "email": "test@mail.com",
      "phone": "090534543534",
      "createdAt": "2021-06-16T06:08:17.000Z",
      "updatedAt": "2021-09-24T08:15:39.000Z",
    }

    it('should return true', async () => {
      const res = await shopController.update(mockShopData, mockUpdateData);
      expect(res).toBe(true);
    })
  });
});

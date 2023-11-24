import { OrderItemInventoryStatusEnum } from "../../../src/constants";
import { ConfigRepository, IProductDao, LowStockProductNotificationRepository, OrderingItemsRepository, ProductRepository } from "../../../src/dal";
import { LockingTypeEnum, ProductStatusEnum, ShopStatusEnum } from "../../../src/database";
import { OrderingItemsService, ProductInventoryService } from "../../../src/services";

const productMockData = [{
    id: 1,
    stock: 10,
    parameterSets: []
  },{
    id: 2,
    stock: 15,
    parameterSets: []
  }
];

jest.mock('../../../src/services/ordering-items', () => {
  const orderingItemsService = {
    getStockAfterMinusOrdering: jest.fn(() => Promise.resolve(4)),
  };
  
  return {
    OrderingItemsService: jest.fn(() => orderingItemsService)
  };
});

jest.mock('../../../src/dal', () => {
  const productRepository = {
    findAll: jest.fn(() => Promise.resolve(productMockData))
  };
  
  return {
    ProductRepository: jest.fn(() => productRepository),
    ConfigRepository: jest.fn(),
    OrderingItemsRepository: jest.fn(),
    LowStockProductNotificationRepository: jest.fn()
  };
});

describe('Service-ProductInventoryService', () => {
  describe('ProductInventoryService', () => {
    const configRepository = new ConfigRepository();
    const orderingItemsRepository = new OrderingItemsRepository();
    const orderingItemsService = new OrderingItemsService({ orderingItemsRepository, configRepository });
    const productRepository = new ProductRepository();
    const lowStockProductNotificationRepository = new LowStockProductNotificationRepository();

    const inventoryService = new ProductInventoryService({
      productRepository,
      orderingItemsService,
      configRepository,
      lowStockProductNotificationRepository,
      productParameterSetRepository: {} as any
    });
  
    describe('checkQuantityStockByProductsId', () => {
      it('should return InStock', async () => {
        const result = await inventoryService.checkQuantityStockByProductsId([{
          productId: 1,
          quantity: 4,
          type: LockingTypeEnum.STOCK
        }, {
          productId: 2,
          quantity: 3,
          type: LockingTypeEnum.STOCK
        }]);
        expect(result).toBe(OrderItemInventoryStatusEnum.INSTOCK);
      });

      it('should return InsufficientStock', async () => {
        const result = await inventoryService.checkQuantityStockByProductsId([{
          productId: 1,
          quantity: 10,
          type: LockingTypeEnum.STOCK
        }, {
          productId: 2,
          quantity: 3,
          type: LockingTypeEnum.STOCK
        }]);
        expect(result).toBe(OrderItemInventoryStatusEnum.INSUFFICIENT);
      });
    });

    describe('loadAvailabeStock', () => {
      it('should without error', async () => {
        const product: IProductDao = {
          id: 1,
          nameId: '123',
          userId: 1,
          price: 100,
          shopId: 1,
          status: ProductStatusEnum.PUBLISHED,
          isFeatured: true,
          hasParameters: true,
          shop: {
            id: 1,
            nameId: '112',
            userId: 1,
            isFeatured: true,
            platformPercents: 2,
            experiencePlatformPercents: 2,
            totalPublishedProducts: 10,
            status: ShopStatusEnum.PUBLISHED,
            createdAt: Date.now.toString(),
            updatedAt: Date.now.toString()
          },
          contents: [],
          stories: [],
          colors: [],
          patterns: [],
          customParameters: [],
          materials: [],
          images: [],
          categories: [],
          highlightPoints: [],
          regionalShippingFees: [],
          transparencies: [],
          locations: [],
          producers: [],
          parameterSets: [],
          createdAt: Date.now.toString(),
          updatedAt: Date.now.toString()
        };

        await inventoryService.loadAvailabeStock(product);
        expect(orderingItemsService.getStockAfterMinusOrdering).toBeCalled();
      });
    });
  });
});

import { InstoreShipOptionEnum } from '../../../src/constants';
import { ShopRepository } from '../../../src/dal';
import {
  IOrderingItemsModel,
  IProductColorModel,
  IProductContentModel,
  IProductCustomParameterModel,
  IProductModel,
  IProductParameterSetModel,
  LockingItemStatusEnum,
  LockingTypeEnum,
  OrderingItemsDbModel,
  ProductColorDbModel,
  ProductContentDbModel,
  ProductCustomParameterDbModel,
  ProductDbModel,
  ProductParameterSetDbModel,
  ProductStatusEnum,
  SalesMethodEnum,
  ShopDbModel,
  ShopStatusEnum
} from '../../../src/database/models';
import { generateNameId } from '../../../src/helpers';
import { clearProductDataByIds } from '../helpers/product.helper';

interface ICreateProductResult {
  product: IProductModel;
  content: IProductContentModel;
  colors?: IProductColorModel[];
  customParameter?: IProductCustomParameterModel;
  parameterSets?: IProductParameterSetModel[];
}

interface IRequestData {
  productId: number;
  colorId?: number;
  customParameterId?: number;
  quantity: number;
  shipOption: InstoreShipOptionEnum;
}

const request = require('supertest');
const app = require('../index');
const loggedInUserId = 9999;
const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';

export const instoreValidateAddProductsToCart = () => {
  describe('INSTORE VALIDATE ADD PRODUCT TO CART', () => {
    let shop: any;
    let sequenceNumber = 0;

    const createProduct = async (salesMethod: SalesMethodEnum, hasParameters: boolean): Promise<ICreateProductResult> => {
      const product: IProductModel = await ProductDbModel.create<any>({
        shopId: shop.id,
        userId: loggedInUserId,
        nameId: `Test product ${sequenceNumber}`,
        categoryId: 1,
        price: 1000,
        stock: 4,
        shipLaterStock: 2,
        salesMethod: salesMethod,
        hasParameters: hasParameters,
        productWeight: 5,
        language: 'en',
        isFreeShipment: true,
        status: ProductStatusEnum.PUBLISHED,
        displayPosition: salesMethod == SalesMethodEnum.INSTORE ? sequenceNumber : null
      });

      const content: IProductContentModel = await ProductContentDbModel.create<any>({
        productId: product.id,
        title: `Title ${sequenceNumber}`,
        subTitle: 'sub title test',
        annotation: 'annotation test',
        description: 'desc'
      });

      let result: ICreateProductResult = { product, content };

      if(hasParameters) {
        const color1: IProductColorModel = await ProductColorDbModel.create<any>({
          productId: product.id,
          color: `Color 1 ${sequenceNumber}`,
          displayPosition: sequenceNumber,
          isOrigin: true
        });

        const color2: IProductColorModel = await ProductColorDbModel.create<any>({
          productId: product.id,
          color: `Color 2 ${sequenceNumber}`,
          displayPosition: sequenceNumber,
          isOrigin: true
        });
  
        const customParameter: IProductCustomParameterModel = await ProductCustomParameterDbModel.create<any>({
          productId: product.id,
          customParameter: `Custom ${sequenceNumber}`,
          displayPosition: sequenceNumber,
          isOrigin: true
        });
  
        const parameterSet1: IProductParameterSetModel = await ProductParameterSetDbModel.create<any>({
          productId: product.id,
          colorId: color1.id,
          customParameterId: customParameter.id,
          price: sequenceNumber,
          stock: 7,
          purchasedNumber: sequenceNumber,
          enable: true,
          shipLaterStock: 5
        });

        const parameterSet2: IProductParameterSetModel = await ProductParameterSetDbModel.create<any>({
          productId: product.id,
          colorId: color2.id,
          customParameterId: customParameter.id,
          price: sequenceNumber,
          stock: sequenceNumber,
          purchasedNumber: sequenceNumber,
          enable: false,
          shipLaterStock: sequenceNumber
        });

        result = { ...result, colors:[color1, color2], customParameter, parameterSets: [parameterSet1, parameterSet2] };
      }
      
      sequenceNumber++;

      return result;
    };

    const createOrderingItem = async (productId: number, type: LockingTypeEnum, color?: number, customParameter?: number): Promise<IOrderingItemsModel> => {
      const orderingItem: IOrderingItemsModel = await OrderingItemsDbModel.create<any>({
        userId: 1,
        orderId: 1,
        paymentIntentId: `test-${sequenceNumber}`,
        productId: productId,
        productNameId: 'test',
        color: color,
        customParameter: customParameter,
        status: LockingItemStatusEnum.LOCKED,
        quantity: 1,
        type
      });

      sequenceNumber++;

      return orderingItem;
    };

    beforeAll(async () => {
      const shopData = {
        nameId:  generateNameId(),
        userId: loggedInUserId,
        isFeatured: true,
        status: ShopStatusEnum.PUBLISHED,
        email: 'test@email.com'
      };

      shop = await new ShopRepository().create(shopData);
    });

    afterAll(async () => {
      await ShopDbModel.destroy({
        where: { id: shop.id },
        force: true
      });

      const createdProductsList = await ProductDbModel.findAll({
        where: {
          userId: [loggedInUserId, 1]
        },
        attributes: ['id']
      });
      const productIds: number[] = createdProductsList.map(item => {
        return (item as any).id;
      });

      await clearProductDataByIds(productIds);

      await OrderingItemsDbModel.destroy({
        where: { productId: productIds },
        force: true
      })
    });

    
    describe('Validation pass', () => {
      it('Product without parameter, should return 200', async () => {
        const createdProductData = await createProduct(SalesMethodEnum.INSTORE, false);
        
        let requestData: IRequestData = {
          productId: createdProductData.product.id,
          quantity: (createdProductData.product.stock || 0),
          shipOption: InstoreShipOptionEnum.INSTORE
        };

        let response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.data).toEqual(true);


        requestData.shipOption = InstoreShipOptionEnum.SHIP_LATER;
        requestData.quantity = createdProductData.product.shipLaterStock || 0;

        response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.data).toEqual(true);
      });

      it('Product has parameter, should return 200', async () => {
        const createdProductData = await createProduct(SalesMethodEnum.INSTORE, true);
        const parameterSet = createdProductData.parameterSets?.find(p => p.enable);
        
        let requestData: IRequestData = {
          productId: createdProductData.product.id,
          colorId: parameterSet?.colorId,
          customParameterId: parameterSet?.customParameterId,
          quantity: (parameterSet?.stock || 0),
          shipOption: InstoreShipOptionEnum.INSTORE
        };

        let response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.data).toEqual(true);


        requestData.shipOption = InstoreShipOptionEnum.SHIP_LATER;
        requestData.quantity = (parameterSet?.shipLaterStock || 0);

        response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.data).toEqual(true);
      });

      it('Has ordering item, product without parameter, should return 200', async () => {
        const createdProductData = await createProduct(SalesMethodEnum.INSTORE, false);
        const orderingItemStock = await createOrderingItem(createdProductData.product.id, LockingTypeEnum.STOCK);
        const orderingItemShipLaterStock = await createOrderingItem(createdProductData.product.id, LockingTypeEnum.SHIP_LATER_STOCK);
        
        let requestData: IRequestData = {
          productId: createdProductData.product.id,
          quantity: (createdProductData.product.stock || 0) - orderingItemStock.quantity,
          shipOption: InstoreShipOptionEnum.INSTORE
        };

        let response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.data).toEqual(true);


        requestData.shipOption = InstoreShipOptionEnum.SHIP_LATER;
        requestData.quantity = (createdProductData.product.shipLaterStock || 0) - orderingItemShipLaterStock.quantity;

        response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.data).toEqual(true);
      });

      it('Has ordering item, product has parameter, should return 200', async () => {
        const createdProductData = await createProduct(SalesMethodEnum.INSTORE, true);
        const parameterSet = createdProductData.parameterSets?.find(p => p.enable);
        const orderingItemStock = await createOrderingItem(createdProductData.product.id, LockingTypeEnum.STOCK, parameterSet?.colorId, parameterSet?.customParameterId);
        const orderingItemShipLaterStock = await createOrderingItem(createdProductData.product.id, LockingTypeEnum.SHIP_LATER_STOCK, parameterSet?.colorId, parameterSet?.customParameterId);
        
        let requestData: IRequestData = {
          productId: createdProductData.product.id,
          colorId: parameterSet?.colorId,
          customParameterId: parameterSet?.customParameterId,
          quantity: (parameterSet?.stock || 0) - orderingItemStock.quantity,
          shipOption: InstoreShipOptionEnum.INSTORE
        };

        let response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.data).toEqual(true);


        requestData.shipOption = InstoreShipOptionEnum.SHIP_LATER;
        requestData.quantity = (parameterSet?.shipLaterStock || 0) - orderingItemShipLaterStock.quantity;

        response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.data).toEqual(true);
      });
    });


    describe('Validation fail', () => {
      it('missing type, should return 400 error', async () => {
        const createdProductData = await createProduct(SalesMethodEnum.INSTORE, false);

        const requestData = {
          productId: createdProductData.product.id,
          quantity: 4
        };

        const response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.error.statusCode).toEqual(400);
      });

      it('parameter not found, should return 409 error', async () => {
        const createdProductData = await createProduct(SalesMethodEnum.INSTORE, true);

        let requestData: IRequestData = {
          productId: createdProductData.product.id,
          colorId: 999,
          quantity: 4,
          shipOption: InstoreShipOptionEnum.INSTORE
        };

        let response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.error.statusCode).toEqual(409);
        expect(response.body.error.message).toEqual('ParameterIsNotFound');


        requestData = {
          productId: createdProductData.product.id,
          quantity: 4,
          shipOption: InstoreShipOptionEnum.INSTORE
        };

        response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.error.statusCode).toEqual(409);
        expect(response.body.error.message).toEqual('MissingParameter');
      });

      it('parameter disabled, should return 409 error', async () => {
        const createdProductData = await createProduct(SalesMethodEnum.INSTORE, true);
        const disabledParameterSet = createdProductData.parameterSets?.find(p => !p.enable);

        const requestData: IRequestData = {
          productId: createdProductData.product.id,
          colorId: disabledParameterSet?.colorId,
          customParameterId: disabledParameterSet?.customParameterId,
          quantity: 4,
          shipOption: InstoreShipOptionEnum.INSTORE
        };

        const response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.error.statusCode).toEqual(409);
        expect(response.body.error.message).toEqual('ProductParameterSetIsUnavailable');
      });

      it('Insufficient Stock, product without parameter, should return 400 error', async () => {
        const createdProductData = await createProduct(SalesMethodEnum.INSTORE, false);
        
        let requestData: IRequestData = {
          productId: createdProductData.product.id,
          quantity: (createdProductData.product.stock || 0) + 1,
          shipOption: InstoreShipOptionEnum.INSTORE
        };

        let response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.error.statusCode).toEqual(400);
        expect(response.body.error.message).toEqual('InsufficientStock');


        requestData.shipOption = InstoreShipOptionEnum.SHIP_LATER;
        requestData.quantity = (createdProductData.product.shipLaterStock || 0) + 1

        response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.error.statusCode).toEqual(400);
        expect(response.body.error.message).toEqual('InsufficientStock');
      });

      it('Insufficient Stock, product has parameter, should return 400 error', async () => {
        const createdProductData = await createProduct(SalesMethodEnum.INSTORE, true);
        const parameterSet = createdProductData.parameterSets?.find(p => p.enable);
        
        let requestData: IRequestData = {
          productId: createdProductData.product.id,
          colorId: parameterSet?.colorId,
          customParameterId: parameterSet?.customParameterId,
          quantity: (parameterSet?.stock || 0) + 1,
          shipOption: InstoreShipOptionEnum.INSTORE
        };

        let response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.error.statusCode).toEqual(400);
        expect(response.body.error.message).toEqual('InsufficientStock');


        requestData.shipOption = InstoreShipOptionEnum.SHIP_LATER;
        requestData.quantity = (parameterSet?.shipLaterStock || 0) + 1;

        response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.error.statusCode).toEqual(400);
        expect(response.body.error.message).toEqual('InsufficientStock');
      });

      it('Insufficient Stock, has ordering item, product without parameter, should return 400 error', async () => {
        const createdProductData = await createProduct(SalesMethodEnum.INSTORE, false);
        await createOrderingItem(createdProductData.product.id, LockingTypeEnum.STOCK);
        await createOrderingItem(createdProductData.product.id, LockingTypeEnum.SHIP_LATER_STOCK);
        
        let requestData: IRequestData = {
          productId: createdProductData.product.id,
          quantity: (createdProductData.product.stock || 0),
          shipOption: InstoreShipOptionEnum.INSTORE
        };

        let response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.error.statusCode).toEqual(400);
        expect(response.body.error.message).toEqual('InsufficientStock');


        requestData.shipOption = InstoreShipOptionEnum.SHIP_LATER;
        requestData.quantity = (createdProductData.product.shipLaterStock || 0)

        response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.error.statusCode).toEqual(400);
        expect(response.body.error.message).toEqual('InsufficientStock');
      });

      it('Insufficient Stock, has ordering item, product has parameter, should return 400 error', async () => {
        const createdProductData = await createProduct(SalesMethodEnum.INSTORE, true);
        const parameterSet = createdProductData.parameterSets?.find(p => p.enable);
        await createOrderingItem(createdProductData.product.id, LockingTypeEnum.STOCK, parameterSet?.colorId, parameterSet?.customParameterId);
        await createOrderingItem(createdProductData.product.id, LockingTypeEnum.SHIP_LATER_STOCK, parameterSet?.colorId, parameterSet?.customParameterId);
        
        let requestData: IRequestData = {
          productId: createdProductData.product.id,
          colorId: parameterSet?.colorId,
          customParameterId: parameterSet?.customParameterId,
          quantity: (parameterSet?.stock || 0),
          shipOption: InstoreShipOptionEnum.INSTORE
        };

        let response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.error.statusCode).toEqual(400);
        expect(response.body.error.message).toEqual('InsufficientStock');


        requestData.shipOption = InstoreShipOptionEnum.SHIP_LATER;
        requestData.quantity = (parameterSet?.shipLaterStock || 0)

        response = await request(app)
          .post('/api/v1/instore-orders/validate-purchase-product')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(response.body).toBeDefined();
        expect(response.body.error.statusCode).toEqual(400);
        expect(response.body.error.message).toEqual('InsufficientStock');
      });
    });
  });
}

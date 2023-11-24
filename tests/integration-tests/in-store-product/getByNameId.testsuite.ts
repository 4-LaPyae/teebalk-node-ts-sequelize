import { IUpdateProductParameterSetModel } from '../../../src/controllers/product/interfaces';
import {
  ShopRepository
} from '../../../src/dal';
import {
  ProductDbModel,
  ShopDbModel,
  ShopStatusEnum,
  ProductColorDbModel,
  ProductCustomParameterDbModel,
  ProductStatusEnum,
  OrderingItemsDbModel,
  LockingTypeEnum,
  LockingItemStatusEnum,
  IShopModel,
  SalesMethodEnum
} from '../../../src/database/models';

import { generateNameId } from '../../../src/helpers';
import { clearTestShopDataById } from '../helpers';
import { clearProductDataByIds } from '../helpers/product.helper';
const request = require('supertest');
const app = require('../index');

export const getByNameId = () =>
  describe('GET Instore Product by NameId', () => {
    const shopRepository = new ShopRepository();

    let shop: IShopModel;
    let otherShop: IShopModel;
    let userToken: string;
    let product: any;
    let productData: any;
    let orderingItem: any;
    let colors: any;
    let others: any;
    let parameterSets: any;

    beforeAll(async () => {
      const shopData = {
        nameId: generateNameId(),
        userId: 9999,
        platformPercents: 5,
        isFeatured: true,
        status: ShopStatusEnum.PUBLISHED,
        email: 'test@email.com'
      };
      shop = await shopRepository.create(shopData);

      otherShop = await shopRepository.create({
        nameId: 'testothershop',
        userId: 9998,
        isFeatured: true,
        status: ShopStatusEnum.PUBLISHED,
        email: 'testothershop@email.com'
      });
      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';

      productData = {
        price: 1000,
        stock: 23,
        shipLaterStock: 45,
        content: { title: 'Product Test 01', isOrigin: true },
        language: 'en',
        isFreeShipment: false,
        images: [{
          imagePath: 'https://localhost:9000',
          isOrigin: true
        }],
        shippingFees: [{
          quantityFrom: 1,
          quantityTo: 10,
          shippingFee: 1000,
          overseasShippingFee: null,
          regionalShippingFees: [{
            prefectureCode: "JP-47",
            shippingFee: null
          }, {
            prefectureCode: "JP-01",
            shippingFee: null
          }]
        }]
      };
      const res = await request(app)
        .post(`/api/v1/products/in-store/add`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData);
      product = res.body.data;

      await ProductDbModel.create<any>({
        shopId: otherShop.id,
        userId: 9999,
        nameId: 'productnameid',
        categoryId: 1,
        price: 1000,
        purchasedNumber: 12,
        stock: 12,
        productWeight: 5,
        language: 'en',
        isFreeShipment: true,
        salesMethod: SalesMethodEnum.INSTORE
      });

      await ProductDbModel.update(
        {
          shopId: shop.id,
          userId: shop.userId,
          status: ProductStatusEnum.PUBLISHED
        },
        { where: { id: product.id } }
      );

      orderingItem = {
        userId: 1111,
        orderId: 1000,
        paymentIntentId: 'pi_abcd',
        productId: product.id,
        productNameId: product.nameId,
        quantity: 3,
        status: LockingItemStatusEnum.PRISTINE,
        type: LockingTypeEnum.STOCK
      }

      await OrderingItemsDbModel.create(orderingItem);
    });

    afterAll(async () => {
      const shopIds = [shop.id, otherShop.id];

      await ShopDbModel.destroy({
        where: { id: shopIds },
        force: true
      });
      
      const createdProductsList = await ProductDbModel.findAll({
        where: {
          shopId: shopIds
        },
        attributes: ['id']
      });
      const productIds: number[] = createdProductsList.map(item => {
        return (item as any).id;
      });

      await OrderingItemsDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await Promise.all([
        clearProductDataByIds(productIds),
        clearTestShopDataById([shop.id])
      ]);
    });

    
    it('Not login should get HTTP 401 when get details in-store product', async () => {
      const res = await request(app).get(`/api/v1/products/in-store/${product.nameId}`);

      expect(res.statusCode).toEqual(401);
    });

    it('access other shop, should get HTTP 404 when get details in-store product', async () => {
      const res = await request(app)
        .get(`/api/v1/products/in-store/productnameid`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error.message).toBe(`Not found`);
    });

    it('should get HTTP 404 when status different published', async () => {

      await ProductDbModel.update(
        {
          shopId: shop.id,
          userId: shop.userId
        },
        { where: { nameId: 'productnameid' } }
      );
      const res = await request(app)
        .get(`/api/v1/products/in-store/productnameid`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.error.message).toBe(`Not found`);
    });

    it('should return status code 400 Bad Request', async () => {
      const invalidProductNameId = '123';
      const res = await request(app)
        .get(`/api/v1/products/in-store/${invalidProductNameId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(400);
    });

    it('should return status code 404 Not Found', async () => {
      const productNameId = generateNameId(5);
      const res = await request(app)
        .get(`/api/v1/products/in-store/${productNameId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
    });

    it('it should return include parameter sets', async () => {
      const { colors, others } = await insertParameterSets(product, userToken);

      const res = await request(app)
        .get(`/api/v1/products/in-store/${product.nameId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.body.data.parameterSets.length).toEqual(colors.length * others.length);
      expect(res.body.data.parameterSets.map((x: any) => x.images).flat().length).toEqual(colors.length * others.length * 2);

    });

    it('should return calculate stock correct when locking item without parameter set', async () => {

      const res = await request(app)
        .get(`/api/v1/products/in-store/${product.nameId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.stock).toBe(productData.stock - orderingItem.quantity);
    });

    it('should return calculate ship_later_shop correct when locking item without parameter set', async () => {

      await OrderingItemsDbModel.update({ type: LockingTypeEnum.SHIP_LATER_STOCK }, { where: { userId: 1111, productId: product.id } });
      const res = await request(app)
        .get(`/api/v1/products/in-store/${product.nameId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.stock).toBe(productData.stock);
      expect(res.body.data.shipLaterStock).toBe(productData.shipLaterStock - orderingItem.quantity);
    });

    it('should return calculate ship_later_shop correct when locking item with parameter set', async () => {
      await ProductDbModel.update(
        {
          stock: null,
          shipLaterStock: null,
          hasParameters: true
        },
        { where: { id: product.id } }
      );
      const dataColor = [{id: 0, color: "color", displayPosition: 0, isOrigin: true, language: "en"}];
      colors = await request(app)
        .post(`/api/v1/products/${product.id}/parameters/colors`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(dataColor);

      const dataOther = [{
        id: 0,
        customParameter: "other",
        displayPosition: 0,
        isOrigin: true
      }];
      others = await request(app)
        .post(`/api/v1/products/${product.id}/parameters/others`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(dataOther);

      parameterSets = [{
        colorId: colors.body.data[0].id,
        customParameterId: others.body.data[0].id,
        enable: true,
        id: 0,
        images: [],
        price: 1000,
        shipLaterStock: 10,
        stock: 12
      }];
      await request(app)
        .post(`/api/v1/products/${product.id}/parameter-sets`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(parameterSets);
      
        await OrderingItemsDbModel.update({ color: colors.body.data[0].id , customParameter: others.body.data[0].id }, { where: { userId: 1111, productId: product.id } });

      const res = await request(app)
        .get(`/api/v1/products/in-store/${product.nameId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.parameterSets[0].stock).toBe(parameterSets[0].stock);
      expect(res.body.data.parameterSets[0].shipLaterStock).toBe(parameterSets[0].shipLaterStock - orderingItem.quantity);
    });

    it('should return calculate stock correct when locking item with parameter set', async () => {

      await OrderingItemsDbModel.update({ type: LockingTypeEnum.STOCK }, { where: { userId: 1111, productId: product.id } });
      const res = await request(app)
        .get(`/api/v1/products/in-store/${product.nameId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.parameterSets[0].shipLaterStock).toBe(parameterSets[0].shipLaterStock);
      expect(res.body.data.parameterSets[0].stock).toBe(parameterSets[0].stock - orderingItem.quantity);
    });
  });


async function insertParameterSets(product: any, userToken: string) {
  const parameterSets: any = [];

  const productId = product.id;
  const colors = await ProductColorDbModel.findAll({ where: { productId } }) as any;
  const others = await ProductCustomParameterDbModel.findAll({ where: { productId } }) as any;
  for (const color of colors) {
    for (const other of others) {
      let parameterSet: Partial<IUpdateProductParameterSetModel>;

      parameterSet = {
        colorId: color.id,
        customParameterId: other.id,
        price: 123,
        stock: 100,
        shipLaterStock: 70,
        images: [{ imagePath: 'test.png' }, { imagePath: 'test2.png' }],
        enable: true
      };
      parameterSets.push(parameterSet);
    }
  }

  const res = await request(app)
    .post(`/api/v1/products/${productId}/parameter-sets`)
    .set('Authorization', 'Bearer ' + userToken)
    .send(parameterSets);
  expect(res.statusCode).toEqual(200);

  return { colors, others };
}


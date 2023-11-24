import {
  IProductModel,
  ProductAvailableNotificationDbModel,
  ProductCategoryDbModel,
  ProductDbModel,
  ProductParameterSetDbModel,
  SalesMethodEnum,
  ShopDbModel
} from "../../../src/database";
import { createTestShop } from "../helpers";

const request = require('supertest');
const app = require('..');
const loggedInUserId = 9999;
const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';

export const inStoreProductParameterSetTest = () => {

  describe('INSTORE PRODUCT PARAMETER SETS', () => {
    let shop: any;

    const createProduct = async (salesMethod: SalesMethodEnum, stock: number, shipLaterStock: number | null) => {
      const product: IProductModel = await ProductDbModel.create<any>({
        shopId: shop.id,
        userId: loggedInUserId,
        nameId: 'test-product-' + Date.now().toString(),
        categoryId: 1,
        price: 1000,
        stock: stock,
        shipLaterStock: shipLaterStock,
        salesMethod: salesMethod,
        hasParameters: true,
        productWeight: 5,
        language: 'en',
        isFreeShipment: true
      });

      return product;
    };

    beforeAll(async () => {
      shop = await createTestShop();
    });

    afterAll(async () => {
      const createdProductsList = await ProductDbModel.findAll({
        where: { userId: 9999 },
        attributes: ['id']
      });

      const productIds: number[] = createdProductsList.map(item => {
        return (item as any).id;
      });

      await ShopDbModel.destroy({
        where: { id: shop.id },
        force: true
      });

      await ProductCategoryDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductDbModel.destroy({
        where: { id: productIds },
        force: true
      });

      await ProductParameterSetDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

      await ProductAvailableNotificationDbModel.destroy({
        where: { productId: productIds },
        force: true
      });

    });

    describe('Update stock to main product', () => {

      it('Instore product, should update stock, shipLaterStock', async () => {
        const parameterSets = [
          {
            colorId: 1,
            customParameterId: 1,
            price: 123,
            stock: 100,
            shipLaterStock: 200,
            images: [],
            enable: true
          },
          {
            colorId: 1,
            customParameterId: 2,
            price: 200,
            stock: 300,
            shipLaterStock: 400,
            images: [],
            enable: true
          },
          {
            colorId: 1,
            customParameterId: 3,
            price: 300,
            stock: 400,
            shipLaterStock: 500,
            images: [],
            enable: false
          }
        ];

        const totalShipLaterStock = parameterSets.filter(p => p.enable).reduce((sum, current) => sum + current.shipLaterStock, 0);
        const totalStock = parameterSets.filter(p => p.enable).reduce((sum, current) => sum + current.stock, 0);
  
        const createdProduct = await createProduct(SalesMethodEnum.INSTORE, 100, 200);
          
        const res = await request(app)
          .post(`/api/v1/products/${createdProduct.id}/parameter-sets`)
          .set('Authorization', 'Bearer ' + userToken)
          .send(parameterSets);

        const product: IProductModel = await ProductDbModel.findOne<any>({
          where: {
              id: createdProduct.id
          }
        });

        expect(res.statusCode).toEqual(200);
        expect(product.stock).toEqual(totalStock);
        expect(product.shipLaterStock).toEqual(totalShipLaterStock);
      })

      it('ONLINE product, should update stock, shipLaterStock should be null', async () => {
        const parameterSets = [
          {
            colorId: 1,
            customParameterId: 1,
            price: 123,
            stock: 100,
            shipLaterStock: 0,
            images: [],
            enable: true
          },
          {
            colorId: 1,
            customParameterId: 2,
            price: 200,
            stock: 300,
            shipLaterStock: 0,
            images: [],
            enable: true
          },
          {
            colorId: 1,
            customParameterId: 3,
            price: 300,
            stock: 400,
            shipLaterStock: 0,
            images: [],
            enable: false
          }
        ];

        const totalStock = parameterSets.filter(p => p.enable).reduce((sum, current) => sum + current.stock, 0);
  
        const createdProduct = await createProduct(SalesMethodEnum.ONLINE, 100, null);
          
        const res = await request(app)
          .post(`/api/v1/products/${createdProduct.id}/parameter-sets`)
          .set('Authorization', 'Bearer ' + userToken)
          .send(parameterSets);

        const product: IProductModel = await ProductDbModel.findOne<any>({
          where: {
              id: createdProduct.id
          }
        });

        expect(res.statusCode).toEqual(200);
        expect(product.stock).toEqual(totalStock);
        expect(product.shipLaterStock).toEqual(null);
      })
    })
  })
}
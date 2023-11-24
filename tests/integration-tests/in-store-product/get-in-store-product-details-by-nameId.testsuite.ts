import { Op } from 'sequelize';
import {
  ProductDbModel,
  ProductStatusEnum
} from '../../../src/database/models';
  
import { generateNameId } from '../../../src/helpers';
import { userId, userToken } from '../constants';
import { clearProductDataByIds, clearTestShopDataById, createTestShop } from '../helpers';
  const request = require('supertest');
  const app = require('../index');
  
  export const getInstoreProductByNameId = () =>
    describe('GET Instore Product by NameId', () => {  
      let shop: any;
      let product: any;
      let productData: any;
  
      beforeAll(async () => {
        shop = await createTestShop();  
        productData = {
          price: 1000,
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
            },{
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
        });
  
        afterAll(async () => {
          const createdProductsList = await ProductDbModel.findAll({
            where: {
              [Op.or]: [{ userId }, { userId: 1111 }]
            },
            attributes: ['id']
          });
          const productIds: number[] = createdProductsList.map(item => {
            return (item as any).id;
          });
    
          await Promise.all([
            clearProductDataByIds(productIds),
            clearTestShopDataById([shop.id])
          ]);
        });
  
      it('should return status code 200 OK Request', async () => {

        await request(app)
          .patch(`/api/v1/products/in-store/${product.id}/publish`)
          .set('Authorization', `Bearer ${userToken}`);

        const res = await request(app)
          .get(`/api/v1/products/in-store/${product.nameId}/edit`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).not.toBeUndefined();
      });
  
      it('should return status code 200 with in-store product images', async () => {

        const res = await request(app)
          .get(`/api/v1/products/in-store/${product.nameId}/edit`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.images.length).toEqual(1);
        expect(res.body.data.images[0].imagePath).toEqual(productData.images[0].imagePath);
      });

      it('should return status code 200 with information shop', async () => {
        await ProductDbModel.update({ shopId: shop.id }, { where: { nameId: product.nameId } });
        const res = await request(app)
          .get(`/api/v1/products/in-store/${product.nameId}/edit`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.shop.content.title).not.toBeNull();
        expect(res.body.data.shop.images.length).toBeGreaterThan(0);
        expect(res.body.data.shop.images[0].imagePath).not.toBeNull();
      });
  
      it('should return status code 400 Bad Request', async () => {
        const invalidNameId = '123';
        const res = await request(app)
          .get(`/api/v1/products/in-store/${invalidNameId}/edit`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(400);
      });
  
      it('should return status code 404 Not Found', async () => {
        const productId = generateNameId(5);
        const res = await request(app)
          .get(`/api/v1/products/in-store/${productId}/edit`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(404);
      });

      it('should return error 404 Not load data of other seller', async () => {
        const productData = {
          userId: 1111,
          shopId: 1,
          nameId:  generateNameId(5),
          status: ProductStatusEnum.PUBLISHED
        };

        const otherSeller = await ProductDbModel.create(productData).value as any; 
        const res = await request(app)
          .get(`/api/v1/products/in-store/${otherSeller.nameId}/edit`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(404);
      });
    });
  
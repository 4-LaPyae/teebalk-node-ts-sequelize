import { Op } from 'sequelize';
import {
    ProductContentRepository,
    ProductImageRepository,
    ProductRepository
  } from '../../../src/dal';
  import {
    ProductDbModel,
    ProductStatusEnum,
    SalesMethodEnum
  } from '../../../src/database/models';
  import { generateNameId } from '../../../src/helpers';
import { userToken } from '../constants';
import { clearProductDataByIds, clearTestShopDataById, createTestShop } from '../helpers';
  const request = require('supertest');
  const app = require('../index');
  
  export const testUpdateInstoreProductById = () =>
    describe('PATCH Update Instore Product by Id', () => {
      const productContentRepository = new ProductContentRepository();
      const productImageRepository = new ProductImageRepository();
      const productRepository = new ProductRepository();
  
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
            [Op.or]: [{ userId: 9999 }, { userId: 1111 }]
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
  
      it('should get return updated content', async () => {
        const updateData = {
          content: {
            title: "updated"
          }
        };
  
        const res = await request(app)
          .patch(`/api/v1/products/in-store/${product.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        const item = await productContentRepository.findOne({
          where: { productId: product.id }
        });
        expect(res.statusCode).toEqual(200);
        expect(item.title).toEqual(updateData.content.title);
        expect(item.description).toEqual(null);
        expect(item.subTitle).toEqual(null);
        expect(item.annotation).toEqual(null);
      });
  
      it('should get return updated images', async () => {
        const item = await productImageRepository.findOne({
          where: { productId: product.id }
        });
        const updateData = {
          images: [
            {
              id: item.id,
              imagePath: 'http://abc',
            }
          ]
        };
        const res = await request(app)
          .patch(`/api/v1/products/in-store/${product.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
  
        const updatedProduct = await productImageRepository.findOne({
          where: { id: item.id }
        });
        expect(res.statusCode).toEqual(200);
        expect(updatedProduct.imagePath).toBe(updateData.images[0].imagePath);
        expect(updatedProduct.imageDescription).toBe(null);
      });
  
      it('should return error 409 Not Exist', async () => {
        const updateData = {
          content: {
            title: "<p>updated</p>"
          }
        };
        const productId = 123;
        const res = await request(app)
          .patch(`/api/v1/products/in-store/${productId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(409);
      });

      it('should return error 404 Not update in-store product of other seller', async () => {
        const productData = {
          userId: 1111,
          shopId: 1,
          nameId:  generateNameId(5),
          status: ProductStatusEnum.DRAFT,
          salesMethod: SalesMethodEnum.INSTORE
        };

        const productOtherSeller = await productRepository.create(productData) as any;

        const updateData = {
            images: [
              {
                imagePath: 'http://abc'
              }
            ]
        };
        
        const res = await request(app)
          .patch(`/api/v1/products/in-store/${productOtherSeller.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);

        expect(res.statusCode).toEqual(404);
      });

      it('should return error 403 Not update a published in-store product of other seller', async () => {
        const productData = {
          userId: 1111,
          shopId: 1,
          nameId:  generateNameId(5),
          status: ProductStatusEnum.PUBLISHED,
          salesMethod: SalesMethodEnum.INSTORE
        };

        const productOtherSeller = await productRepository.create(productData) as any;

        const updateData = {
            content: {
              title: "<p>updated</p>"
            },
            images: [
              {
                imagePath: 'http://abc'
              }
            ]
        };
        
        const res = await request(app)
          .patch(`/api/v1/products/in-store/${productOtherSeller.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);

        expect(res.statusCode).toEqual(403);
      });

      it('should get return error 400 required title', async () => {
        await productRepository.update({ 
          status: ProductStatusEnum.PUBLISHED,
          salesMethod: SalesMethodEnum.INSTORE },
          { where: { id: product.id } });
        const updateData = {
          content: {
            isOrigin: true
          }
        };
        const res = await request(app)
          .patch(`/api/v1/products/in-store/${product.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe(`"title" is required`);
      });

      it('should get return error 400 required imagePath', async () => {
        const updateData = {
          content: {
            title: "<p>updated</p>"
          },
          images: [
            {
              origin: true
            }
          ]
        };
        const res = await request(app)
          .patch(`/api/v1/products/in-store/${product.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe(`"imagePath" is not allowed to be empty`);
      });
  });
  
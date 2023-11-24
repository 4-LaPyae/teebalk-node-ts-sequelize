import { LanguageEnum } from '../../../src/constants';
import {
    ShopRepository
  } from '../../../src/dal';
  import {
    ProductColorDbModel,
    ProductContentDbModel,
    ProductCustomParameterDbModel,
    ProductDbModel,
    ProductImageDbModel,
    ProductStatusEnum,
    ShopDbModel,
    ShopStatusEnum
  } from '../../../src/database/models';
import { generateNameId } from '../../../src/helpers';
  
  const request = require('supertest');
  const app = require('../index');
  
  export const getListInstoreProducts = () =>
    describe('GET ALL PRODUCTS IN STORE /all', () => {
      const shopRepository = new ShopRepository();

      let shop: any;
      let userToken: string;
      let product: any;
  
      beforeAll(async () => {
        const shopData = {
          nameId: generateNameId(8),
          userId: 9999,
          platformPercents: 5,
          isFeatured: true,
          status: ShopStatusEnum.PUBLISHED,
          email: 'test@email.com'
        };
        shop = await shopRepository.create(shopData);
        userToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';
  
          const productData = {
            userId: 9999,
            shopId: shop.id,
            nameId: generateNameId(8),
            status: ProductStatusEnum.PUBLISHED,
            price: 100,
            stock: 5
          };
    
          product = await ProductDbModel.create(productData);
          const productColorData = {
            productId: product.id,
            color: 'Blue',
            displayPosition: 0,
            isOrigin: true
          };
    
          const productCustomParameterData = {
            productId: product.id,
            customParameter: '[Logo] Tells',
            displayPosition: 0,
            isOrigin: true
          };
    
          const productImageData = {
            productId: product.id,
            imagePath: 'http://localhost:9000',
            imageDescription: '',
            isOrigin: true,
            language: LanguageEnum.ENGLISH
          };
    
          const productContentData = {
            productId: product.id,
            title: 'Product Title',
            subTitle: '',
            description: '',
            annotation: '',
            isOrigin: true,
            language: LanguageEnum.ENGLISH
          };
    
          await ProductColorDbModel.create(productColorData);
          await ProductCustomParameterDbModel.create(productCustomParameterData);
          await ProductImageDbModel.create(productImageData);
          await ProductContentDbModel.create(productContentData);

        });

  
      afterAll(async () => {
        await ProductDbModel.destroy({
          where: { id: product.id },
          force: true
        });
        await ProductColorDbModel.destroy({
          where: { productId: product.id },
          force: true
        });
        await ProductCustomParameterDbModel.destroy({
          where: { productId: product.id },
          force: true
        });
        await ProductImageDbModel.destroy({
          where: { productId: product.id },
          force: true
        });
        await ProductContentDbModel.destroy({
          where: { productId: product.id },
          force: true
        });
        await ShopDbModel.destroy({
          where: { id: shop.id },
          force: true
        });
      });
  
      it('should return status code 200 OK Request', async () => {
        const res = await request(app)
          .get(`/api/v1/products/in-store/all?limit=9&pageNumber=1`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).not.toBeUndefined();
      });

      it('should get return error 400 limit bigger 100', async () => {
        const res = await request(app)
          .get(`/api/v1/products/in-store/all?limit= 120`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(400);
      });

      it('should get return error 400 pageNumber is 0', async () => {
        const res = await request(app)
          .get(`/api/v1/products/in-store/all?pageNumber=0`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(400);
      });
    });
  
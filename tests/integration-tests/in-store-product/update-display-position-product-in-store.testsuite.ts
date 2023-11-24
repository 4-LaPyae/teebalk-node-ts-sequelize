import {
    ShopRepository
  } from '../../../src/dal';
  import {
    ProductDbModel,
    ProductStatusEnum,
    ShopDbModel,
    ShopStatusEnum
  } from '../../../src/database/models';
import { generateNameId } from '../../../src/helpers';
  
  const request = require('supertest');
  const app = require('../index');
  
  export const updatePositionInstoreProducts = () =>
    describe('UPDATE DISPLAY POSITION PRODUCTS IN STORE', () => {
      const shopRepository = new ShopRepository();

      let shop: any;
      let userToken: string;
      let firstProduct: any;
      let secondProduct: any;
  
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
  
          const firstProductData = {
            userId: 9999,
            shopId: shop.id,
            nameId: generateNameId(8),
            status: ProductStatusEnum.PUBLISHED,
            price: 100,
            stock: 5,
            displayPosition: 1
          };

          const secondProductData = {
            userId: 9999,
            shopId: shop.id,
            nameId: generateNameId(8),
            status: ProductStatusEnum.PUBLISHED,
            price: 100,
            stock: 5,
            displayPosition: 2
          };
    
          firstProduct = await ProductDbModel.create(firstProductData);
          secondProduct = await ProductDbModel.create(secondProductData);
        });

  
      afterAll(async () => {
        await ProductDbModel.destroy({
          where: { id: firstProduct.id | secondProduct.id },
          force: true
        });
        await ShopDbModel.destroy({
          where: { id: shop.id },
          force: true
        });
      });

      it('should get return error 400 nameId is required', async () => {
        const updateData = [
          {
            displayPosition: 'test'
          },     
          {
             nameId: secondProduct.nameId,
             displayPosition: 1
          }
        ];
        const res = await request(app)
          .patch(`/api/v1/products/in-store/display-position`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe(`"nameId" is required`);
      });

      it('should get return error 400 displayPosition is required', async () => {
        const updateData = [
          {
            nameId: firstProduct.nameId
          },     
          {
             nameId: secondProduct.nameId,
             displayPosition: 1
          }
        ];
        const res = await request(app)
          .patch(`/api/v1/products/in-store/display-position`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe(`"displayPosition" is required`);
      });

      it('should get return error 400 displayPosition > 0', async () => {
        const updateData = [
          {
            nameId: firstProduct.nameId,
            displayPosition: 0
          },     
          {
             nameId: secondProduct.nameId,
             displayPosition: 1
          }
        ];
        const res = await request(app)
          .patch(`/api/v1/products/in-store/display-position`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe(`"displayPosition" must be larger than or equal to 1`);
      });

      it('should get return error 400 displayPosition is number', async () => {
        const updateData = [
          {
            nameId: firstProduct.nameId,
            displayPosition: 'test'
          },     
          {
             nameId: secondProduct.nameId,
             displayPosition: 1
          }
        ];
        const res = await request(app)
          .patch(`/api/v1/products/in-store/display-position`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe(`"displayPosition" must be a number`);
      });

      it('should get return error 400 duplication displayPosition field', async () => {
        const updateData = [
          {
            nameId: firstProduct.nameId,
            displayPosition: 1
          },     
          {
             nameId: secondProduct.nameId,
             displayPosition: 1
          }
        ];
        const res = await request(app)
          .patch(`/api/v1/products/in-store/display-position`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe(`"body" position 1 contains a duplicate value`);
      });

      it('should return status code 200 OK Request', async () => {
        const updateData = [
          {
            nameId: firstProduct.nameId,
            displayPosition: 2
          },     
          {
             nameId: secondProduct.nameId,
             displayPosition: 1
          }
        ];
        const res = await request(app)
          .patch(`/api/v1/products/in-store/display-position`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toEqual(true);

        var product =  await ProductDbModel.findOne({where:{ nameId: firstProduct.nameId }}) as any;
        expect(product.displayPosition).toBe(2);
      });
    });
  
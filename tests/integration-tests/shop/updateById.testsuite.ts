const request = require('supertest');
const app = require('../index');
import { ShopRepository } from '../../../src/dal';
import { ShopDbModel, ShopStatusEnum } from '../../../src/database/models';

export const testUpdateShopById = () =>
  describe('SHOP UPDATE BY ID', () => {
    let shopId: number | null = 0;
    let userToken: string;
    let updateData: object | null = null;
    const shopNameId = 'shop9999';

    beforeAll(async () => {
      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';
      const shopRepository = new ShopRepository();
      const shopDataCreate = {
        nameId: shopNameId,
        userId: 9999,
        isFeatured: true,
        status: ShopStatusEnum.PUBLISHED,
        title: 'shop test',
        language: 'en',
        email: 'test@email.com',
        policy: 'shop policy'
      };
      await shopRepository.create(shopDataCreate);
      
      const res = await request(app)
        .get(`/api/v1/shops/${shopNameId}`)
        .set('Authorization', `Bearer ${userToken}`);
      const shop = res.body.data;
      shopId = shop ? shop.id : null;

      const images = shop.images.map((item: { id: number; imagePath: string; isOrigin: boolean }) => ({
        id: item.id,
        imagePath: item.imagePath,
        isOrigin: item.isOrigin
      }));

      updateData = {
        title: shopDataCreate.title,
        website: shop.website,
        email: shop.email,
        phone: shop.phone,
        images: images,
        language: shopDataCreate.language,
        policy: shopDataCreate.policy
      };
    });

    afterAll(async () => {
      await ShopDbModel.destroy({
        where: { userId: 9999 },
        force: true
      });
    });

    describe('SHOP UPDATE: Update Shop successfully', () => {
      it('Expect return status 200', async () => {
        if (shopId && updateData) {

          const res = await request(app)
            .patch(`/api/v1/shops/${shopId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(updateData);
            
          expect(res.statusCode).toEqual(200);
          expect(res.body.data).not.toBeUndefined();
        }
      });
    });

    describe('SHOP UPDATE: validate fields & return start 400', () => {
      it('Title required', async () => {
        if (shopId && updateData) {
          updateData = {
            ...updateData,
            title: null
          };
          const res = await request(app)
            .patch(`/api/v1/shops/${shopId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(updateData);
          expect(res.statusCode).toEqual(400);
        }
      });
      it('Email required', async () => {
        if (shopId && updateData) {
          updateData = {
            ...updateData,
            email: null
          };
          const res = await request(app)
            .patch(`/api/v1/shops/${shopId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(updateData);
          expect(res.statusCode).toEqual(400);
        }
      });
      it('Email invalid', async () => {
        if (shopId && updateData) {
          updateData = {
            ...updateData,
            email: 'test'
          };
          const res = await request(app)
            .patch(`/api/v1/shops/${shopId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(updateData);
          expect(res.statusCode).toEqual(400);
        }
      });
      it('Phone invalid', async () => {
        if (shopId && updateData) {
          updateData = {
            ...updateData,
            phone: 'test'
          };
          const res = await request(app)
            .patch(`/api/v1/shops/${shopId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(updateData);
          expect(res.statusCode).toEqual(400);
        }
      });
      it('Policy required', async () => {
        if (shopId && updateData) {
          updateData = {
            ...updateData,
            policy: null
          };
          const res = await request(app)
            .patch(`/api/v1/shops/${shopId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(updateData);
          expect(res.statusCode).toEqual(400);
        }
      });

      it('set free shipping settings without error', async () => {
        const res = await request(app)
        .post(`/api/v1/shops/${shopNameId}/free-shipping-settings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          minAmountFreeShippingDomestic: 1000,
          minAmountFreeShippingOverseas: 2000
        });
  
        expect(res.statusCode).toEqual(200);
      });

      it('set free shipping settings to null without error', async () => {
        const res = await request(app)
        .post(`/api/v1/shops/${shopNameId}/free-shipping-settings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          minAmountFreeShippingDomestic: null,
          minAmountFreeShippingOverseas: null
        });
  
        expect(res.statusCode).toEqual(200);  
      });

      it('set free shipping settings will return error', async () => {
        const res = await request(app)
        .post(`/api/v1/shops/${shopNameId}/free-shipping-settings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          minAmountFreeShippingDomestic: null
        });
  
        expect(res.statusCode).toEqual(400);  
      });

      it('set free shipping settings will return error not found', async () => {
        const res = await request(app)
        .post(`/api/v1/shops/abcdef/free-shipping-settings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          minAmountFreeShippingDomestic: null,
          minAmountFreeShippingOverseas: null
        });
  
        expect(res.statusCode).toEqual(404);  
      });
    });
  });

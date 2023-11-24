const request = require('supertest');
const app = require('../index');
import { ShopRepository } from '../../../src/dal';
import {
  ShopDbModel,
  ShopStatusEnum
} from '../../../src/database/models';

export const testGetShopDetail = () =>
  describe('SHOP: GET DETAIL', () => {
    let userToken: string;
    let nameId: string;
    let shop: any;

    beforeAll(async () => {
      const shopRepository = new ShopRepository();
      const shopData = {
        nameId: 'shop9998',
        userId: 9999,
        platformPercents: 5,
        isFeatured: true,
        minAmountFreeShippingDomestic: 1000,
        minAmountFreeShippingOverseas: 2000,
        status: ShopStatusEnum.PUBLISHED,
        email: 'test@email.com',
        policy: 'shop policy'
      };
      shop = await shopRepository.create(shopData);
      nameId = shop.nameId;
      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NzEzLCJpYXQiOjE2MzI0NzIyNjIsImV4cCI6MTYzMjU1ODY2Mn0.EamkYihT-MtBGl7ENWf3M0sDC0LLv32TeWLRRbyfpnw';
    });

    afterAll(async () => {
      await ShopDbModel.destroy({
        where: { id: shop.id },
        force: true
      });
    });

    it('Return request status 200 success', async () => {
      const res = await request(app)
          .get(`/api/v1/shops/${nameId}`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).not.toBeUndefined();
    });

    it('Return request status 400 Bad Request', async () => {
      const shopNameId = '1';
      const res = await request(app).get(`/api/v1/shops/${shopNameId}`);
      expect(res.statusCode).toEqual(400);
    });

    it('Return request status 404 Not Found', async () => {
      const shopNameId = '1dsaf3fesfsdf';
      const res = await request(app).get(`/api/v1/shops/${shopNameId}`);
      expect(res.statusCode).toEqual(404);
    });

    it('Expect elements is existing in response result', async () => {
      const res = await request(app)
        .get(`/api/v1/shops/${nameId}`)
        .set('Authorization', `Bearer ${userToken}`);
      const data = res.body.data;
      expect(data).toHaveProperty('website');
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('phone');
      expect(data).toHaveProperty('images');
      expect(data).toHaveProperty('minAmountFreeShippingDomestic');
      expect(data).toHaveProperty('minAmountFreeShippingOverseas');
    });
  });

import { ShopRepository } from '../../../src/dal';
import { ShopDbModel, ShopStatusEnum } from '../../../src/database/models';

const app = require('../index');
const request = require('supertest');

export const testSellerRole = () =>
  describe('seller_authorization', () => {
    const shopRepository = new ShopRepository();

    let publishedShop: any;
    let userToken: string;

    beforeAll(async () => {
      const shopData = {
        id: 9999,
        nameId: '123',
        userId: 9999,
        isFeatured: true,
        status: ShopStatusEnum.PUBLISHED,
        email: 'test@email.com'
      };

      publishedShop = await shopRepository.create(shopData);

      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';
    });

    afterAll(async () => {
      await ShopDbModel.destroy({
        where: { id: publishedShop.id },
        force: true
      });
    });

    it('Seller should get HTTP 400 when creating a new product', async () => {
      const res = await request(app)
        .post(`/api/v1/products/add`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ test: 'test' });

      expect(res.statusCode).toEqual(400);
    });

    it('Seller should get HTTP 409 when deleting an un-existing product', async () => {
      const res = await request(app)
        .delete(`/api/v1/products/9999999`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(409);
    });
  });

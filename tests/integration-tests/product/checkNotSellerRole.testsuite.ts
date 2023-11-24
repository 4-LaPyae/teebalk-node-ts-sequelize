const app = require('../index');
const request = require('supertest');

export const testNotSellerRole = () =>
  describe('not_seller_authorization', () => {
    let userToken: string;

    beforeAll(async () => {
      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';
    });

    afterAll(async () => {});

    it('Not login should get HTTP 401 when creating a new product', async () => {
      const res = await request(app).post(`/api/v1/products/add`);

      expect(res.statusCode).toEqual(401);
    });

    it('User Not seller should get HTTP 403 when creating a new product', async () => {
      const res = await request(app)
        .post(`/api/v1/products/add`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
    });

    it('User Not seller should get HTTP 400 when creating a new product', async () => {
      const res = await request(app)
        .post(`/api/v1/products/add`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ test: 'test' });

      expect(res.statusCode).toEqual(403);
    });

    it('User Not seller should get HTTP 404 when deleting an un-existing product', async () => {
      const res = await request(app)
        .delete(`/api/v1/products/9999999`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });

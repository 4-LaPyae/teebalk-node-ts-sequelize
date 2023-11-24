const request = require('supertest');
const app = require('../index');

export const testGetAllCategories = () =>
  describe('[CATEGORIES] - Get categories list', () => {
    it('should return status code 200 OK Request', async () => {
      const res = await request(app).get(`/api/v1/categories`);
      expect(res.statusCode).toEqual(200);
    });
  });

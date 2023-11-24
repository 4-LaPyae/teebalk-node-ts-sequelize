const request = require('supertest');
const app = require('../index');

export const testGetAllHighlightPoints = () =>
  describe('GET /api/v1/highlight-points', () => {
    it('should return status code 200 OK Request', async () => {
      const res = await request(app).get(`/api/v1/highlight-points/`);
      expect(res.statusCode).toEqual(200);
    });
  });

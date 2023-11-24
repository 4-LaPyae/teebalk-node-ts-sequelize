const request = require('supertest');
const app = require('../index');

export const testGetAllEthicalityLevels = () =>
  describe('[ETHICALITY_LEVEL] - Get ethicality-levels list', () => {
    it('should return status code 200 OK Request', async () => {
      const res = await request(app).get(`/api/v1/ethicality-levels/`);
      expect(res.statusCode).toEqual(200);
    });
  });

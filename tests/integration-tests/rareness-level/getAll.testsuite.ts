const request = require('supertest');
const app = require('../index');

export const testGetAllRarenessLevel = () =>
  describe('GET /', () => {
    let userToken: string;
    beforeAll(async () => {
      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';
    });
    it('should return status code 200 OK Request', async () => {
      const res = await request(app)
        .get(`/api/v1/rareness-levels/`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(200);
    });
  });

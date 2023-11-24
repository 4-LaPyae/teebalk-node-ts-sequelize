import { NewsletterSubscriberDbModel } from '../../../src/database';

const request = require('supertest');
const app = require('../index');

export const testAddNewsletterSubscriber = () => {
  const mockEmail = { email: 'Testing@random.com' };

  describe('POST /api/v1/email-subscribers', () => {
    afterAll(async () => {
      await NewsletterSubscriberDbModel.destroy({
        where: { email: mockEmail.email },
        force: true
      });
    });

    describe('[ADD EMAIL NOTFICATION]: Add email SUCCESSFULL', () => {
      it('should return status code 200 OK Request', async () => {
        const res = await request(app)
          .post(`/api/v1/email-subscribers`)
          .send(mockEmail);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toEqual(true);
      });

      it('should return status code 200 OK Request', async () => {
        const res = await request(app)
          .post(`/api/v1/email-subscribers`)
          .send(mockEmail);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toEqual(true);
      });
    });

    describe('[ADD EMAIL NOTFICATION]: Add email FAILED', () => {
      it('should return status code 400 BAD REQUEST', async () => {
        const wrongEmail = {
          email: 'Testing'
        };
        const res = await request(app)
          .post(`/api/v1/email-subscribers`)
          .send(wrongEmail);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toEqual(`Parameter 'email' is invalid`);
      });

      it('should return status code 400 BAD REQUEST', async () => {
        const wrongEmail = {
          email: 'Testing.com'
        };
        const res = await request(app)
          .post(`/api/v1/email-subscribers`)
          .send(wrongEmail);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toEqual(`Parameter 'email' is invalid`);
      });

      it('should return status code 400 BAD REQUEST', async () => {
        const wrongEmail = {
          email: 'Testing@com'
        };
        const res = await request(app)
          .post(`/api/v1/email-subscribers`)
          .send(wrongEmail);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toEqual(`Parameter 'email' is invalid`);
      });
    });
  });
};

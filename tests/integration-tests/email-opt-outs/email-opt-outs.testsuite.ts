const request = require('supertest');
const app = require('../index');

import { UserEmailOptoutDBModel } from '../../../src/database/models'
const userToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIwLCJpYXQiOjE2MzkzNzc5MTgsImV4cCI6MTYzOTQ2NDMxOH0.ak4Xvgc0Xn31TU3fh5AEWrsFPhsvj0Pyr3_SQfZdclA';

export const testGetProductAvailableSubscribe = () =>
    describe('[EMAIL OPT OUTS]', () => {

        it('should return status 401 when have no permission', async () => {
            const res = await request(app)
                .get(`/api/v1/users/me/email-optouts`);

            expect(res.statusCode).toEqual(401);
        })
        it('should return status code 200', async () => {
            const res = await request(app)
                .get(`/api/v1/users/me/email-optouts`)
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.statusCode).toEqual(200);
        });

        it('should create email opt outs return 400 when invalid :emailNotification ', async () => {
            const res = await request(app)
                .post(`/api/v1/users/me/email-optouts/INVALID_TYPES`)
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.statusCode).toEqual(400);
        })

        it('should create email notify unsubscribe setting successfully', async () => {
            const res = await request(app)
                .post(`/api/v1/users/me/email-optouts/TELLS_FWSHOP_CUSTOMER_AVAILABLE_PRODUCTS_NOTIFICATION`)
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.statusCode).toEqual(200);
        })

        it('should return list email notify unsubscribe user setting', async () => {
            const res = await request(app)
                .get(`/api/v1/users/me/email-optouts`)
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('should delete email notify unsubscribe sitting ok', async () => {
            const res = await request(app)
                .delete(`/api/v1/users/me/email-optouts/TELLS_FWSHOP_CUSTOMER_AVAILABLE_PRODUCTS_NOTIFICATION`)
                .set('Authorization', `Bearer ${userToken}`)

            expect(res.statusCode).toEqual(200);

            var setting = await UserEmailOptoutDBModel.findAll({
                where: {
                    user_id: 9999,
                    email_notification: 'TELLS_FWSHOP_CUSTOMER_AVAILABLE_PRODUCTS_NOTIFICATION'
                }
            });

            expect(setting.length).toEqual(0);
        })
    });

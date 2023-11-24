const request = require('supertest');
const app = require('../index');
const userToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIwLCJpYXQiOjE2MzkzNzc5MTgsImV4cCI6MTYzOTQ2NDMxOH0.ak4Xvgc0Xn31TU3fh5AEWrsFPhsvj0Pyr3_SQfZdclA';

export const getAllExperienceCategories = () =>
    describe('GET EXPERIENCE CATEGORIES', () => {

        it('when valid data should return 200', async () => {

            const res = await request(app)
                .get(`/api/v1/experience-categories`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data[0].name.en = "Activity");
            expect(res.body.data[0].name.ja = "アクティビティ");

        });
    })


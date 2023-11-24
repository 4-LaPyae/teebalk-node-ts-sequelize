import { Op } from "sequelize";
import { ExperienceDbModel, ExperienceOrderManagementDbModel, ExperienceSessionDbModel, ExperienceSessionTicketDbModel, ExperienceStatusEnum, ShopDbModel, ShopStatusEnum } from "../../../src/database";
import { clearTestExperienceDataByUserId, clearTestShopDataById } from "../helpers";

const request = require('supertest');
const app = require('../index');
import { generateNameId } from '../../../src/helpers';
const userToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIwLCJpYXQiOjE2MzkzNzc5MTgsImV4cCI6MTYzOTQ2NDMxOH0.ak4Xvgc0Xn31TU3fh5AEWrsFPhsvj0Pyr3_SQfZdclA';

export const statusValidateExperienceSessionTicketsTest = () =>
    describe('STATUS VALIDATE TICKETS', () => {
        let experienceId: number;
        let experienceNameId: number;
        let shop: any;
        let session: any;
        let ticket: any;

        beforeAll(async () => {

            const shopData = {
                nameId: generateNameId(),
                userId: 9999,
                isFeatured: true,
                status: ShopStatusEnum.PUBLISHED,
                email: 'test@email.com'
            };
            shop = await ShopDbModel.create(shopData);

            const experienceData = {
                title: "t test",
                description: "<p>experience description</p>",
                organizers: [
                    {
                        id: 0,
                        name: "organizer 1",
                        position: "position 1",
                        comment: "comment experience 1",
                        photo: "https://qa-tells-storage.s3.ap-northeast-1.amazonaws.com/public/experience/images/41484ad0-c5fc-11ec-bb36-2fe04ceb1a26",
                        isOrigin: true,
                        displayPosition: 1
                    }
                ],
                categoryId: 1,
                images: [
                    {
                        id: 0,
                        imagePath: "https://qa-tells-storage.s3.ap-northeast-1.amazonaws.com/public/experience/images/53cb5df0-c5fc-11ec-b2eb-87b937283dfc",
                        imageDescription: "",
                        position: 1
                    }
                ],
                storySummary: "<p>experience story summary</p>",
                story: "<h1>story</h1>",
                requiredItems: "<p>required items to bring with 1</p>",
                warningItems: "<p>Warning items 1</p><p> </p>",
                cancelPolicy: "<p>cancellation policy 1</p>",
                tickets: [
                    {
                        availableUntilMins: 1440,
                        free: false,
                        id: 0,
                        offline: false,
                        online: true,
                        price: 11,
                        quantity: 111,
                        reflectChange: false,
                        title: "ticket 1",
                        position:1
                    },
                    {
                        availableUntilMins: 2880,
                        free: false,
                        id: 0,
                        offline: false,
                        online: true,
                        price: 111,
                        quantity: 111,
                        reflectChange: false,
                        title: "ticket 2",
                        position:1
                    }
                ],
                sessions: [
                    {
                        id: 0,
                        startTime: "2022-04-27T07:34:53.024Z",
                        endTime: "2022-04-30T07:34:00.000Z",
                        defaultTimezone: "Japan",
                        tickets: [
                            {
                                availableUntilMins: 1440,
                                city: null,
                                country: null,
                                enable: true,
                                eventLink: null,
                                eventPassword: null,
                                id: 0,
                                location: null,
                                locationCoordinate: null,
                                locationPlaceId: null,
                                offline: false,
                                online: true,
                                price: 11,
                                quantity: 111,
                                title: "ticket 1",
                                position:1
                            },
                            {
                                availableUntilMins: 2880,
                                city: null,
                                country: null,
                                enable: true,
                                eventLink: null,
                                eventPassword: null,
                                id: 0,
                                location: null,
                                locationCoordinate: null,
                                locationPlaceId: null,
                                offline: false,
                                online: true,
                                price: 111,
                                quantity: 111,
                                title: "ticket 2",
                                position:1
                            }
                        ]
                    },
                    {
                        id: 0,
                        startTime: "9022-04-28T07:34:53.024Z",
                        endTime: "9022-05-01T07:34:00.000Z",
                        defaultTimezone: "Africa/Algiers",
                        tickets: [
                            {
                                availableUntilMins: 1440,
                                city: null,
                                country: null,
                                enable: true,
                                eventLink: null,
                                eventPassword: null,
                                id: 0,
                                location: null,
                                locationCoordinate: null,
                                locationPlaceId: null,
                                offline: false,
                                online: true,
                                price: 11,
                                quantity: 111,
                                title: "ticket 1",
                                position:1
                            },
                            {
                                availableUntilMins: 2880,
                                city: null,
                                country: null,
                                enable: true,
                                eventLink: null,
                                eventPassword: null,
                                id: 0,
                                location: null,
                                locationCoordinate: null,
                                locationPlaceId: null,
                                offline: false,
                                online: true,
                                price: 111,
                                quantity: 111,
                                title: "ticket 2",
                                position:1
                            }
                        ]
                    }
                ],
                transparency: {
                    ethicalLevel: 61,
                    materialNaturePercent: 50,
                    materials: [
                        {
                            id: 172,
                            material: "testing tr",
                            percent: 23,
                            displayPosition: 0,
                            isOrigin: true
                        }
                    ],
                    highlightPoints: [
                        2
                    ],
                    sdgs: [
                        2
                    ],
                    sdgsReport: "<p>abcv</p>",
                    recycledMaterialPercent: 49,
                    rarenessLevel: 1,
                    recycledMaterialDescription: "<p>use of recycled<img src=\"https://qa-tells-storage.s3.ap-northeast-1.amazonaws.com/public/product/images/eab24310-c123-11ec-9609-737035b05714\"></p>",
                    contributionDetails: "<p>testing for contribution</p>",
                    effect: "<p>testing for effect<img src=\"https://qa-tells-storage.s3.ap-northeast-1.amazonaws.com/public/product/images/eab6d6f0-c123-11ec-876d-3df18fe88032\"></p>",
                    culturalProperty: "<p>testing for cultural</p>",
                    rarenessDescription: "testing for Rareness"
                }
            }

            const res = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(experienceData);
            experienceId = res.body.data.id;
            experienceNameId = res.body.data.nameId;

            await ExperienceDbModel.update({ status: ExperienceStatusEnum.PUBLISHED }, { where: { id: experienceId } });

            session = await ExperienceSessionDbModel.findOne(
                { where: { experience_id: experienceId } }
            );

            ticket = await ExperienceSessionTicketDbModel.findOne(
                { where: { sessionId: session.id } }
            );
        })

        afterAll(async () => {
            const createdExperiencesList = await ExperienceDbModel.findAll({
                where: {
                    userId: 9999
                },
                attributes: ['id']
            });
  
            const experienceIds: number[] = createdExperiencesList.map(item => {
                return (item as any).id;
            });
  
            await ExperienceOrderManagementDbModel.destroy({
                where: { experienceId: experienceIds },
                force: true
            });

            await clearTestExperienceDataByUserId(9999)
            await clearTestShopDataById([shop.id]);
        })

        it('should return error 400 required experienceNameId', async () => {
            const validateData = {
                sessionId: 161,
                startTime: "2022-04-27T07:34:53.000Z",
                endTime: "2022-04-30T07:34:00.000Z"
            };
            const res = await request(app)
                .post(`/api/v1/experience/checkout/validate-tickets`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(validateData);
            expect(res.statusCode).toEqual(400);
            expect(res.body.error.message).toBe(`"experienceNameId" is required`);
        });

        it('should return error 400 required sessionId', async () => {
            const validateData = {
                experienceNameId: "NYmbehDIqKxAhQzlpZTOGOdm7PRITP",
                startTime: "2022-04-27T07:34:53.000Z",
                endTime: "2022-04-30T07:34:00.000Z"
            };
            const res = await request(app)
                .post(`/api/v1/experience/checkout/validate-tickets`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(validateData);
            expect(res.statusCode).toEqual(400);
            expect(res.body.error.message).toBe(`"sessionId" is required`);
        });

        it('should return error 400 required tickets', async () => {
            const validateData = {
                experienceNameId: "NYmbehDIqKxAhQzlpZTOGOdm7PRITP",
                sessionId: 161,
                startTime: "2022-04-30T07:34:00.000Z",
                endTime: "2022-04-30T07:34:00.000Z"
            };
            const res = await request(app)
                .post(`/api/v1/experience/checkout/validate-tickets`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(validateData);
            expect(res.statusCode).toEqual(400);
            expect(res.body.error.message).toBe(`"tickets" is required`);
        });

        it('should return error 400 not found', async () => {

            const validateData = {
                experienceNameId: generateNameId(5),
                sessionId: 161,
                tickets: [
                    {
                        ticketId: 1234567,
                        purchaseQuantity: 2
                    }
                ]
            };
            const res = await request(app)
                .post(`/api/v1/experience/checkout/validate-tickets`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(validateData);

            expect(res.statusCode).toEqual(400);
            expect(res.body.error.message).toBe(`Experience is not found`);
        });

        it('should return error 409 is unavailable', async () => {

            await ExperienceDbModel.update({ status: ExperienceStatusEnum.UNPUBLISHED }, { where: { id: experienceId } });

            const validateData = {
                experienceNameId: experienceNameId,
                sessionId: 161,
                tickets: [
                    {
                        ticketId: 1,
                        purchaseQuantity: 2
                    }
                ]
            };
            const res = await request(app)
                .post(`/api/v1/experience/checkout/validate-tickets`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(validateData);

            expect(res.statusCode).toEqual(409);
            expect(res.body.error.message).toBe(`ExperienceIsUnavailable`);

            await ExperienceDbModel.update({ status: ExperienceStatusEnum.PUBLISHED }, { where: { id: experienceId } });
        });

        it('should return error 400 session is not found', async () => {
            const validateData = {
                experienceNameId: experienceNameId,
                sessionId: 1234,
                tickets: [
                    {
                        ticketId: 1,
                        purchaseQuantity: 2
                    }
                ]
            };
            const res = await request(app)
                .post(`/api/v1/experience/checkout/validate-tickets`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(validateData);

            expect(res.statusCode).toEqual(400);
            expect(res.body.error.message).toBe(`Experience session is not found`);
        });

        it('should return status error SessionTicketsIsNotFound', async () => {            
            const validateData = {
                experienceNameId: experienceNameId,
                sessionId: session.id,
                tickets: [
                    {
                        ticketId: 1234567,
                        purchaseQuantity: 2
                    }
                ]
            };
            const res = await request(app)
                .post(`/api/v1/experience/checkout/validate-tickets`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(validateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.tickets[0].status).toBe(`SessionTicketsIsNotFound`);
        });

        it('should return status error SessionTicketIsUnavailable', async () => {
            await ExperienceSessionTicketDbModel.update(
                {
                    available_until_date: "2021-05-15 11:40:37"
                },
                { where: { id: ticket.id } }
            );

            const validateData = {
                experienceNameId: experienceNameId,
                sessionId: session.id,
                tickets: [
                    {
                        ticketId: ticket.id,
                        purchaseQuantity: 2
                    }
                ]
            };
            const res = await request(app)
                .post(`/api/v1/experience/checkout/validate-tickets`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(validateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.tickets[0].status).toBe(`SessionTicketIsUnavailable`);
        });

        it('should return status error SessionTicketWasUpdated', async () => {
            const date = new Date(Date.now() + Number(5) * 60 * 1000).toISOString();
            await ExperienceSessionTicketDbModel.update(
                {
                    availableUntilDate: date
                },
                { where: { [Op.and]: [{ session_id: session.id }, { id: ticket.id }] } }
            );

            const validateData = {
                experienceNameId: experienceNameId,
                sessionId: session.id,
                tickets: [
                    {
                        ticketId: ticket.id,
                        purchaseQuantity: 2
                    }
                ]
            };
            const res = await request(app)
                .post(`/api/v1/experience/checkout/validate-tickets`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(validateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.tickets[0].status).toBe(`InStock`);
        });


        it('should return status error ExperienceOutOfStock', async () => {

            await ExperienceSessionTicketDbModel.update(
                {
                    quantity: 0
                },
                { where: { [Op.and]: [{ session_id: session.id }, { id: ticket.id }] } }
            );

            const validateData = {
                experienceNameId: experienceNameId,
                sessionId: session.id,
                tickets: [
                    {
                        ticketId: ticket.id,
                        purchaseQuantity: 2
                    }
                ]
            };
            const res = await request(app)
                .post(`/api/v1/experience/checkout/validate-tickets`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(validateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.tickets[0].status).toBe(`ExperienceOutOfStock`);
        });

        
        it('should return status error InsufficientStock', async () => {

            await ExperienceSessionTicketDbModel.update(
                {
                    quantity: 1
                },
                { where: { [Op.and]: [{ session_id: session.id }, { id: ticket.id }] } }
            );

            const validateData = {
                experienceNameId: experienceNameId,
                sessionId: session.id,
                tickets: [
                    {
                        ticketId: ticket.id,
                        purchaseQuantity: 2
                    }
                ]
            };
            const res = await request(app)
                .post(`/api/v1/experience/checkout/validate-tickets`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(validateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.tickets[0].status).toBe(`InsufficientStock`);
        });

        it('should return 200 validate true', async () => {
            await ExperienceSessionTicketDbModel.update(
                {
                    quantity: 5
                },
                { where: { [Op.and]: [{ session_id: session.id }, { id: ticket.id }] } }
            );
            const validateData = {
                experienceNameId: experienceNameId,
                sessionId: session.id,
                tickets: [
                    {
                        ticketId: ticket.id,
                        purchaseQuantity: 2
                    }
                ]
            };
            const res = await request(app)
                .post(`/api/v1/experience/checkout/validate-tickets`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(validateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.tickets[0].status).toBe('InStock');
        });
    })


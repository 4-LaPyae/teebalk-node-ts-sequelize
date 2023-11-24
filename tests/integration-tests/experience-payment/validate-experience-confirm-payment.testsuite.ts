import { generateNameId } from '../../../src/helpers';
import { Op } from "sequelize";
import {
    ExperienceContentDbModel,
    ExperienceDbModel,
    ExperienceOrderManagementDbModel,
    ExperienceSessionDbModel,
    ExperienceSessionTicketDbModel,
    ExperienceOrderStatusEnum,
    ExperienceOrderDbModel,
    ExperienceSessionTicketReservationDbModel,
    ExperienceOrderDetailDbModel,
    ExperienceEventTypeEnum,
    PaymentTransactionDbModel,
    PaymentTransactionStatusEnum,
    ExperienceOrderManagementStatus,
    ExperienceStatusEnum
} from "../../../src/database";
import { DEFAULT_CURRENCY } from '@freewilltokyo/freewill-be';
import { ItemTypeEnum } from '../../../src/constants';
import { clearTestExperienceDataByUserId, clearTestShopDataById, createTestShop } from '../helpers';
import { userId, userToken } from '../constants';

const request = require('supertest');
const app = require('../index');

export const testValidateExperienceConfirmPayment = () =>
    describe('Validate experience amount before payment', () => {
        let experienceId: number;
        let experienceNameId: number;
        let shop: any;
        let session: any;
        let ticket: any;
        let paymentTransaction: any;
        let order: any;
        let orderDetail: any;

        beforeAll(async () => {
            shop = await createTestShop();

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
                        price: 100,
                        quantity: 111,
                        reflectChange: false,
                        title: "ticket 1",
                        position: 1
                    },
                    {
                        availableUntilMins: 2880,
                        free: false,
                        id: 0,
                        offline: false,
                        online: true,
                        price: 200,
                        quantity: 111,
                        reflectChange: false,
                        title: "ticket 2",
                        position: 2
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
                                price: 50,
                                quantity: 111,
                                title: "ticket 1",
                                position: 1
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
                                price: 50,
                                quantity: 111,
                                title: "ticket 2",
                                position: 2
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
                                price: 100,
                                quantity: 111,
                                title: "ticket 1",
                                position: 1
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
                                price: 200,
                                quantity: 111,
                                title: "ticket 2",
                                position: 2
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

            session = await ExperienceSessionDbModel.findOne(
                { where: { experience_id: experienceId } }
            );

            ticket = await ExperienceSessionTicketDbModel.findOne(
                { where: { sessionId: session.id } }
            );

            paymentTransaction = await PaymentTransactionDbModel.create(
                {
                    amount: 5000,
                    paymentIntent: 'testIntentId',
                    stripeFee: 100,
                    platformFee: 0,
                    currency: DEFAULT_CURRENCY,
                    transferAmount: 200,
                    status: PaymentTransactionStatusEnum.CREATED,
                    itemType: ItemTypeEnum.EXPERIENCE
                }
            );

            order = await ExperienceOrderDbModel.create({
                code: "12345678",
                userId: 9999,
                paymentIntentId: paymentTransaction.paymentIntent,
                paymentTransactionId: paymentTransaction.id,
                status: ExperienceOrderStatusEnum.COMPLETED,
                amount: ticket.price * 2,
                usedCoins: 0,
                totalAmount: ticket.price * 2,
                fiatAmount: 1000,
                earnedCoins: 10,
                shopId: shop.id,
                shopTitle: shop.nameId,
                shopEmail: shop.email,
                anonymous: false,
                purchaseTimezone: 'Asia/Ho_Chi_Minh',
                orderedAt: new Date(),
            }) as any;

            orderDetail = await ExperienceOrderDetailDbModel.create({
                orderId: order.id,
                experienceId,
                sessionId: ticket.sessionId,
                sessionTicketId: ticket.id,
                experienceTitle: ticket.title,
                experienceImage: "some image path",
                eventType: ExperienceEventTypeEnum.ONLINE,
                ticketName: ticket.title,
                startTime: session.startTime,
                endTime: session.endTime,
                defaultTimezone: "Japan",
                location: "",
                online: true,
                offline: false,
                eventLink: "some even link",
                price: 1000,
                priceWithTax: 1000,
                quantity: 1,
                totalPrice: 1000,
            }) as any;

            await ExperienceSessionTicketReservationDbModel.create({
                userId: 9999,
                orderDetailId: orderDetail.id,
                ticketCode: "12345678",
                assignedUserId: 9999,
                assignedAt: new Date(),
            })
        })

        afterAll(async () => {
          await clearTestExperienceDataByUserId(userId);
          await clearTestShopDataById(shop.id);
        })

        describe('validate amount payment fail', () => {
            describe('errors validate amount payment', () => {
                it('Miss Experience Name Id, should get return 400 error', async () => {
                    const userShippingAddressData = {
                        id: 'Er36STHloJweUvfDFTgf3DT3wXUhf',
                        orderId: 1,
                        usedCoins: 2,
                        sessionId: 14,
                        startTime: '2022-05-25 00:00:00',
                        endTime: '2022-05-25 03:00:00',
                        amount: 3500,
                        tickets: []
                    };

                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(userShippingAddressData);

                    expect(res.statusCode).toEqual(400);
                    expect(res.body.error.message).toBe(`"experienceNameId" is required`);
                });

                it('Invalid date value, should get return 400 error', async () => {
                    const userShippingAddressData = {
                        id: 'Er36STHloJweUvfDFTgf3DT3wXUhf',
                        orderId: 1,
                        usedCoins: 2,
                        experienceNameId: 'Ex36STHloJpQIUvfDFTgf3DT3wXUhf',
                        experienceTitle: 't test',
                        sessionId: 14,
                        startTime: '2022-05-25 00',
                        endTime: '2022-05-25 03:00:00',
                        amount: 3500,
                        tickets: []
                    };

                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(userShippingAddressData);

                    expect(res.statusCode).toEqual(400);
                    expect(res.body.error.message).toBe(`"startTime" must be a valid ISO 8601 date`);
                });

                it('Ticket list is empty, should get return 400 error', async () => {
                    const userShippingAddressData = {
                        id: 'Er36STHloJpweUvfDFTgf3DT3wXUhf',
                        orderId: 1,
                        usedCoins: 2,
                        experienceNameId: 'Ex36STHloJpQIUvfDFTgf3DT3wXUhf',
                        experienceTitle: 't test',
                        sessionId: 14,
                        startTime: '2022-05-25 00:00:00',
                        endTime: '2022-05-25 03:00:00',
                        amount: 3500,
                        tickets: [{}]
                    };

                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(userShippingAddressData);

                    expect(res.statusCode).toEqual(400);
                    expect(res.body.error.message).toBe(`"ticketId" is required`);
                });

                it('invalid ticket detail, should get return 400 error', async () => {
                    const userShippingAddressData = {
                        id: 'Er36STHloJpweUvfDFTgf3DT3wXUhf',
                        orderId: 1,
                        usedCoins: 50,
                        experienceNameId: 'Ex36STHloJpQIUvfDFTgf3DT3wXUhf',
                        experienceTitle: 't test',
                        sessionId: 14,
                        startTime: '2022-05-25 00:00:00',
                        endTime: '2022-05-25 03:00:00',
                        amount: 50,
                        tickets: [
                            {
                                purchaseQuantity: 1,
                                ticketTitle: 'test',
                                online: true,
                                offline: false,
                                price: 100,
                                amount: 100
                            }
                        ]
                    };

                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(userShippingAddressData);

                    expect(res.statusCode).toEqual(400);
                    expect(res.body.error.message).toBe(`"ticketId" is required`);
                });

                it('Should get return 400 Experience session not found error', async () => {
                    await ExperienceDbModel.update({ status: ExperienceStatusEnum.PUBLISHED }, { where: { id: experienceId } });

                    const userShippingAddressData = {
                        id: 'Er36STHloJpweUvfDFTgf3DT3wXUhf',
                        experienceNameId: experienceNameId,
                        experienceTitle: 't test',
                        sessionId: 14,
                        startTime: '2022-05-25 00:00:00',
                        endTime: '2022-05-25 03:00:00',
                        orderId: 1,
                        usedCoins: 50,
                        amount: 50,
                        totalAmount: 50,
                        tickets: [
                            {
                                ticketId: 1,
                                ticketTitle: 'ticket 1',
                                offline: false,
                                online: true,
                                purchaseQuantity: 1,
                                price: 100,
                                amount: 100
                            }
                        ]
                    };

                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(userShippingAddressData);

                    expect(res.statusCode).toEqual(400);
                    expect(res.body.error.message).toBe(`Experience session is not found`);
                });

                it('should return error 400 experience not found', async () => {

                    const userShippingAddressData = {
                        id: 'Er36STHloJpweUvfDFTgf3DT3wXUhf',
                        experienceNameId: generateNameId(5),
                        experienceTitle: 't test',
                        sessionId: 161,
                        orderId: 1,
                        startTime: "2022-04-30T07:34:00.000Z",
                        endTime: "2022-04-30T07:34:00.000Z",
                        amount: 50,
                        usedCoins: 50,
                        tickets: [
                            {
                                ticketId: 1,
                                ticketTitle: 'test',
                                online: true,
                                offline: false,
                                purchaseQuantity: 2,
                                price: 50,
                                amount: 100
                            }
                        ]
                    };
                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(userShippingAddressData);

                    expect(res.statusCode).toEqual(400);
                    expect(res.body.error.message).toBe(`Experience is not found`);
                });

                it('should return error 409 is unavailable', async () => {
                    await ExperienceDbModel.update({ status: ExperienceStatusEnum.UNPUBLISHED }, { where: { id: experienceId } });

                    const validateData = {
                        id: 'Er36STHloJpweUvfDFTgf3DT3wXUhf',
                        experienceNameId: experienceNameId,
                        experienceTitle: 't test',
                        sessionId: 161,
                        orderId: 1,
                        startTime: "2022-04-30T07:34:00.000Z",
                        endTime: "2022-04-30T07:34:00.000Z",
                        amount: 50,
                        usedCoins: 50,
                        tickets: [
                            {
                                ticketId: 1,
                                ticketTitle: 'test',
                                online: true,
                                offline: false,
                                purchaseQuantity: 2,
                                price: 50,
                                amount: 100
                            }
                        ]
                    };
                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(validateData);

                    expect(res.statusCode).toEqual(409);
                    expect(res.body.error.message).toBe(`ExperienceIsUnavailable`);
                });

                it('should return error 404 session is not found', async () => {

                    await ExperienceDbModel.update({ status: ExperienceStatusEnum.PUBLISHED }, { where: { id: experienceId} });

                    const validateData = {
                        id: 'Er36STHloJpweUvfDFTgf3DT3wXUhf',
                        experienceNameId: experienceNameId,
                        experienceTitle: 't test',
                        orderId: 1,
                        sessionId: 1234,
                        startTime: "2022-04-30T07:34:00.000Z",
                        endTime: "2022-04-30T07:34:00.000Z",
                        amount: 50,
                        usedCoins: 50,
                        tickets: [
                            {
                                ticketId: 1,
                                ticketTitle: 'test',
                                online: true,
                                offline: false,
                                purchaseQuantity: 2,
                                price: 50,
                                amount: 100
                            }
                        ]
                    };
                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(validateData);

                    expect(res.statusCode).toEqual(400);
                    expect(res.body.error.message).toBe(`Experience session is not found`);
                });

                it('should return error 409 ExperienceSessionWasUpdated', async () => {

                    const validateData = {
                        id: 'Er36STHloJpweUvfDFTgf3DT3wXUhf',
                        experienceNameId: experienceNameId,
                        experienceTitle: 't test',
                        sessionId: session.id,
                        orderId: 1,
                        startTime: "2022-04-30T07:34:00.000Z",
                        endTime: "2022-04-30T07:34:00.000Z",
                        amount: 50,
                        usedCoins: 50,
                        tickets: [
                            {
                                ticketId: 1234,
                                ticketTitle: 'test',
                                online: true,
                                offline: false,
                                purchaseQuantity: 2,
                                price: 50,
                                amount: 100
                            }
                        ]
                    };
                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(validateData);

                    expect(res.statusCode).toEqual(409);
                    expect(res.body.error.message).toBe(`ExperienceSessionWasUpdated`);
                });

                it('should return error 404 SessionTicketsIsNotFound', async () => {

                    const validateData = {
                        id: 'Er36STHloJpweUvfDFTgf3DT3wXUhf',
                        orderId: 1,
                        experienceNameId: experienceNameId,
                        experienceTitle: 't test',
                        sessionId: session.id,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        amount: 50,
                        usedCoins: 50,
                        tickets: [
                            {
                                ticketId: 1234,
                                ticketTitle: 'test',
                                online: true,
                                offline: false,
                                purchaseQuantity: 2,
                                price: 50,
                                amount: 100
                            }
                        ]
                    };
                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(validateData);

                    expect(res.statusCode).toEqual(400);
                    expect(res.body.error.message).toBe(`SessionTicketsIsNotFound`);
                });

                it('should return error 409 SessionTicketIsUnavailable', async () => {
                    await ExperienceSessionTicketDbModel.update(
                        {
                            available_until_date: "2021-05-15 11:40:37"
                        },
                        { where: { id: ticket.id } }
                    );

                    const validateData = {
                        id: 'Er36STHloJpweUvfDFTgf3DT3wXUhf',
                        experienceNameId: experienceNameId,
                        orderId: 1,
                        experienceTitle: 't test',
                        sessionId: session.id,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        amount: 50,
                        usedCoins: 50,
                        tickets: [
                            {
                                ticketId: ticket.id,
                                ticketTitle: 'test',
                                online: true,
                                offline: false,
                                purchaseQuantity: 2,
                                price: 50,
                                amount: 100
                            }
                        ]
                    };
                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(validateData);

                    expect(res.statusCode).toEqual(409);
                    expect(res.body.error.message).toBe(`SessionTicketIsUnavailable`);
                });

                it('should return error 409 SessionTicketWasUpdated', async () => {

                    const date = new Date(Date.now() + Number(5) * 60 * 1000).toISOString();
                    await ExperienceSessionTicketDbModel.update(
                        {
                            availableUntilDate: date
                        },
                        { where: { [Op.and]: [{ session_id: session.id }, { id: ticket.id }] } }
                    );

                    const validateData = {
                        id: 'Er36STHloJpweUvfDFTgf3DT3wXUhf',
                        orderId: 1,
                        experienceNameId: experienceNameId,
                        experienceTitle: 't test',
                        sessionId: session.id,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        amount: (ticket.price + 2) * 2,
                        usedCoins: 0,
                        tickets: [
                            {
                                ticketId: ticket.id,
                                ticketTitle: 'test',
                                online: true,
                                offline: false,
                                purchaseQuantity: 2,
                                price: ticket.price + 2,
                                amount: (ticket.price + 2) * 2
                            }
                        ]
                    };
                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(validateData);

                    expect(res.statusCode).toEqual(409);
                    expect(res.body.error.message).toBe(`SessionTicketWasUpdated`);
                });

                it('should return error 400 TicketAmountIncorrect', async () => {

                    const validateData = {
                        id: 'Er36STHloJpweUvfDFTgf3DT3wXUhf',
                        experienceNameId: experienceNameId,
                        experienceTitle: 't test',
                        orderId: 1,
                        sessionId: session.id,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        amount: 50,
                        usedCoins: 50,
                        tickets: [
                            {
                                ticketId: ticket.id,
                                ticketTitle: 'test',
                                online: true,
                                offline: false,
                                purchaseQuantity: 2,
                                price: ticket.price,
                                amount: ticket.price * 3
                            }
                        ]
                    };
                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(validateData);

                    expect(res.statusCode).toEqual(400);
                    expect(res.body.error.message).toBe(`TicketAmountIncorrect`);
                });

                it('should return error 409 ExperienceOutOfStock', async () => {

                    await ExperienceOrderManagementDbModel.create({
                        experienceId,
                        sessionId: session.id,
                        sessionTicketId: ticket.id,
                        quantity: 1,
                        orderId: order.id,
                        userId: 1111,
                        status: ExperienceOrderManagementStatus.LOCKED,
                        paymentIntentId: "test"
                    })

                    await ExperienceSessionTicketDbModel.update(
                        {
                            quantity: 0
                        },
                        { where: { [Op.and]: [{ session_id: session.id }, { id: ticket.id }] } }
                    );

                    const validateData = {
                        id: 'testIntentId',
                        experienceNameId: experienceNameId,
                        experienceTitle: 't test',
                        orderId: order.id,
                        sessionId: session.id,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        amount: ticket.price * 2,
                        usedCoins: 0,
                        tickets: [
                            {
                                ticketId: ticket.id,
                                ticketTitle: 'ticket 1',
                                offline: false,
                                online: true,
                                purchaseQuantity: 2,
                                price: ticket.price,
                                amount: ticket.price * 2
                            }
                        ]
                    };
                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(validateData);

                    expect(res.statusCode).toEqual(409);
                    expect(res.body.error.message).toBe(`ExperienceOutOfStock`);
                });


                it('should return error 409 InsufficientStock', async () => {

                    await ExperienceOrderManagementDbModel.create({
                        experienceId,
                        sessionId: session.id,
                        sessionTicketId: ticket.id,
                        quantity: 2,
                        orderId: order.id,
                        userId: 9999,
                        status: ExperienceOrderManagementStatus.LOCKED,
                        paymentIntentId: "test"
                    })
                    await ExperienceSessionTicketDbModel.update(
                        {
                            quantity: 1
                        },
                        { where: { [Op.and]: [{ session_id: session.id }, { id: ticket.id }] } }
                    );

                    const validateData = {
                        id: 'testIntentId',
                        experienceNameId: experienceNameId,
                        experienceTitle: 't test',
                        orderId: order.id,
                        sessionId: session.id,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        amount: ticket.price * 2,
                        usedCoins: 0,
                        tickets: [
                            {
                                ticketId: ticket.id,
                                ticketTitle: 'ticket 1',
                                offline: false,
                                online: true,
                                purchaseQuantity: 2,
                                price: ticket.price,
                                amount: ticket.price * 2
                            }
                        ]
                    };
                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(validateData);

                    expect(res.statusCode).toEqual(409);
                    expect(res.body.error.message).toBe(`InsufficientStock`);
                });

                it('Experience was updated, should get return 409 error', async () => {
                    await ExperienceContentDbModel.update(
                        {
                            title: 'test updated'
                        },
                        { where: { experienceId } }
                    );
                    const validateData = {
                        id: 'Er36STHloJpweUvfDFTgf3DT3wXUhf',
                        experienceNameId: experienceNameId,
                        experienceTitle: 't test',
                        orderId: 1,
                        sessionId: session.id,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        amount: ticket.price * 2,
                        usedCoins: 0,
                        tickets: [
                            {
                                ticketId: ticket.id,
                                ticketTitle: 'ticket 1',
                                offline: false,
                                online: true,
                                purchaseQuantity: 2,
                                price: ticket.price,
                                amount: ticket.price * 2
                            }
                        ]
                    };

                    const res = await request(app)
                        .post(`/api/v1/payments/experience/validate-confirm-payment`)
                        .set('Authorization', `Bearer ${userToken}`)
                        .send(validateData);

                    expect(res.statusCode).toEqual(409);
                    expect(res.body.error.message).toBe(`ExperienceWasUpdated`);
                });
            });
        });
    });

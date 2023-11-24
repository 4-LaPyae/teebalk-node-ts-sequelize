import {
    ExperienceContentDbModel,
    ExperienceDbModel,
    ExperienceEventTypeEnum,
    ExperienceImageDbModel,
    ExperienceMaterialDbModel,
    ExperienceOrderDbModel,
    ExperienceOrderDetailDbModel,
    ExperienceOrderStatusEnum,
    ExperienceOrganizerDbModel,
    ExperienceSessionDbModel,
    ExperienceSessionTicketDbModel,
    ExperienceSessionTicketReservationDbModel,
    ExperienceStatusEnum,
    ExperienceTicketDbModel,
    ExperienceTransparencyDbModel,
    ShopDbModel,
    ShopStatusEnum
} from "../../../src/database";
import { generateNameId } from "../../../src/helpers";

const request = require('supertest');
const app = require('../index');

export const getExperienceOnlineEventLinkTest = () => {
    describe('GET EXPERIENCE ONLINE EVENT LINK', () => {

        let shop: any;
        let userId = 9999;
        let experienceData: any;
        let experienceIds: number[] = [];
        let ticketCode = '12345678';

        const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIwLCJpYXQiOjE2MzkzNzc5MTgsImV4cCI6MTYzOTQ2NDMxOH0.ak4Xvgc0Xn31TU3fh5AEWrsFPhsvj0Pyr3_SQfZdclA';

        beforeAll(async () => {

            const shopData = {
                nameId: generateNameId(),
                userId,
                isFeatured: true,
                status: ShopStatusEnum.PUBLISHED,
                email: 'test@email.com',
                experiencePlatformPercents: 50,

            };
            shop = await ShopDbModel.create(shopData);

            experienceData = {
                title: 'new experience 1',
                description: '<p>experience description</p>',
                storySummary: '<p>story summary</p>',
                story: '<p>story</p>',
                requiredItems: '<p>requiredItems</p>',
                warningItems: '<p>warningItems</p>',
                tickets: [
                    {
                        title: "Adult",
                        price: 1000,
                        free: false,
                        quantity: 5,
                        availableUntilMins: 5,
                        
                        online: false,
                        offline: true,
                        position: 1,
                        reflectChange: false
                    },
                    {
                        title: "VIP",
                        price: 1000,
                        free: false,
                        quantity: 5,
                        availableUntilMins: 5,
                       
                        online: true,
                        offline: false,
                        position: 1,
                        reflectChange: false
                    }
                ],
                sessions:
                    [
                        {
                            defaultTimezone: "Asia/Tokyo",
                            startTime: "2023-04-15 18:45:37",
                            endTime: "2023-04-15 18:45:37",
                            tickets: [
                                {
                                    title: "Adult",
                                    price: 1000,
                                    quantity: 5,
                                    availableUntilMins: 5,
                                    locationCoordinate: {
                                        type: "Point",
                                        coordinates: [100, 100]
                                    },
                                    locationPlaceId: "123",
                                    location: "sg",
                                    city: "Minato",
                                    country: "JP",
                                    eventLink: "https://example.com",
                                    eventPassword: "abc",
                                    enable: false,
                                    online: false,
                                    offline: true
                                },
                                {
                                    title: "VIP",
                                    price: 1000,
                                    quantity: 5,
                                    availableUntilMins: 5,
                                    locationCoordinate: {
                                        type: "Point",
                                        coordinates: [100, 100]
                                    },
                                    locationPlaceId: "123",
                                    location: "sg",
                                    city: "Minato",
                                    country: "JP",
                                    eventLink: "https://example.com",
                                    eventPassword: "abc",
                                    enable: false,
                                    online: true,
                                    offline: false
                                }
                            ]
                        }
                    ],
                cancelPolicy: '<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<',
                organizers: [],
                images: [{
                    id: 0,
                    experienceId: 0,
                    imageDescription: "image description",
                    imagePath: "some image path",
                    position: 0,

                }]
            };

        })

        afterAll(async () => {

            const createdExperiencesList = await ExperienceDbModel.findAll({
                where: {
                    userId
                },
                attributes: ['id']
            });

            const experienceIds: number[] = createdExperiencesList.map(item => {
                return (item as any).id;
            });

            const createdSessionList = await ExperienceSessionDbModel.findAll({
                where: {
                    experienceId: experienceIds
                },
                attributes: ['id'],
                paranoid: false
            });

            const sessionIds: number[] = createdSessionList.map(item => {
                return (item as any).id;
            });

            await ExperienceContentDbModel.destroy({
                where: { experienceId: experienceIds },
                force: true
            });

            await ExperienceImageDbModel.destroy({
                where: { experienceId: experienceIds },
                force: true
            });

            await ExperienceOrganizerDbModel.destroy({
                where: { experienceId: experienceIds },
                force: true
            });

            await ExperienceTransparencyDbModel.destroy({
                where: { experienceId: experienceIds },
                force: true
            });

            await ExperienceMaterialDbModel.destroy({
                where: { experienceId: experienceIds },
                force: true
            });

            await ExperienceTicketDbModel.destroy({
                where: { experienceId: experienceIds },
                force: true
            });

            await ExperienceSessionTicketDbModel.destroy({
                where: { sessionId: sessionIds },
                force: true
            });

            await ExperienceSessionDbModel.destroy({
                where: { experienceId: experienceIds },
                force: true
            });

            await ExperienceDbModel.destroy({
                where: { userId },
                force: true
            });

            await ShopDbModel.destroy({
                where: { id: shop.id },
                force: true
            });
            await ExperienceSessionTicketReservationDbModel.destroy({
              where: { userId },
              force: true
            })

            await ExperienceOrderDbModel.destroy({
                where: { userId },
                force: true
            })

            await ExperienceOrderDetailDbModel.destroy({
                where: { experienceId: experienceIds },
                force: true
            })
        })

        it('Get online event link: return 409 EventLinkDoesNotExist', async () => {

            let createExperienceRes = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(experienceData) as any;
            experienceIds.push(createExperienceRes.body.data.id);

            expect(createExperienceRes.statusCode).toEqual(200);

            const experienceId = createExperienceRes.body.data.id;

            await ExperienceDbModel.update({ status: ExperienceStatusEnum.PUBLISHED }, { where: { id: experienceId } });

            const experienceSessions = await ExperienceSessionDbModel.findAll({
                where: { experienceId }
            }) as any;

            const experienceSessionTickets = await ExperienceSessionTicketDbModel.findAll({
                where: { sessionId: experienceSessions.map((x: any) => x.id) },
                include: [{ model: ExperienceSessionDbModel, as: "session" }]
            }) as any

            const order = await ExperienceOrderDbModel.create({
                code: ticketCode,
                userId: 9999,
                paymentIntentId: "someIntentId",
                paymentTransactionId: 1,
                status: ExperienceOrderStatusEnum.COMPLETED,
                amount: 1000,
                usedCoins: 0,
                totalAmount: 1000,
                fiatAmount: 1000,
                earnedCoins: 10,
                shopId: shop.id,
                shopTitle: shop.nameId,
                shopEmail: shop.email,
                anonymous: false,
                purchaseTimezone: 'Asia/Ho_Chi_Minh',
                orderedAt: new Date(),
            }) as any;

            for await (const ticket of experienceSessionTickets) {
                const orderDetail = await ExperienceOrderDetailDbModel.create({
                    orderId: order.id,
                    experienceId,
                    sessionId: ticket.sessionId,
                    sessionTicketId: ticket.id,
                    experienceTitle: ticket.title,
                    experienceImage: "some image path",
                    eventType: ExperienceEventTypeEnum.ONLINE,
                    ticketName: ticket.title,
                    startTime: ticket.session.startTime,
                    endTime: ticket.session.endTime,
                    defaultTimezone: "Japan",
                    location: "",
                    online: true,
                    offline: false,
                    eventLink: null,
                    price: 1000,
                    priceWithTax: 1000,
                    quantity: 1,
                    totalPrice: 1000,
                }) as any;

                await ExperienceSessionTicketReservationDbModel.create({
                    userId: 9999,
                    orderDetailId: orderDetail.id,
                    ticketCode: ticketCode,
                    assignedUserId: 9999,
                    assignedAt: new Date(),
                })

                await ExperienceSessionTicketDbModel.update({ eventLink: "" }, {
                    where: {
                        id: ticket.id
                    }
                })
            }

            const session = await ExperienceSessionDbModel.findOne({
                where: { experienceId }
            }) as any;

            await ExperienceSessionTicketReservationDbModel.update({ userId: 9999, assignedUserId: 9999 }, {
                where: {
                    ticketCode
                }
            })

            const experienceOnlineEventLink = await request(app)
                .get(`/api/v1/experiences/${session.id}/${ticketCode}/online-event-link`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(experienceOnlineEventLink.statusCode).toEqual(409);
            expect(experienceOnlineEventLink.body.error.message).toBe('EventLinkDoesNotExist');
        });

        it('Get online event link: return 400 Experience session is not found ', async () => {

            let createExperienceRes = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(experienceData) as any;
            experienceIds.push(createExperienceRes.body.data.id);

            expect(createExperienceRes.statusCode).toEqual(200);

            const experienceId = createExperienceRes.body.data.id;

            const experienceSessions = await ExperienceSessionDbModel.findAll({
                where: { experienceId }
            }) as any;

            const experienceSessionTickets = await ExperienceSessionTicketDbModel.findAll({
                where: { sessionId: experienceSessions.map((x: any) => x.id) },
                include: [{ model: ExperienceSessionDbModel, as: "session" }]
            }) as any

            const order = await ExperienceOrderDbModel.create({
                code: "12345678",
                userId,
                paymentIntentId: "someIntentId",
                paymentTransactionId: 1,
                status: ExperienceOrderStatusEnum.COMPLETED,
                amount: 1000,
                usedCoins: 0,
                totalAmount: 1000,
                fiatAmount: 1000,
                earnedCoins: 10,
                shopId: shop.id,
                shopTitle: shop.nameId,
                shopEmail: shop.email,
                anonymous: false,
                purchaseTimezone: 'Asia/Ho_Chi_Minh',
                orderedAt: new Date(),
            }) as any;

            for await (const ticket of experienceSessionTickets) {
                const orderDetail = await ExperienceOrderDetailDbModel.create({
                    orderId: order.id,
                    experienceId,
                    sessionId: ticket.sessionId,
                    sessionTicketId: ticket.id,
                    experienceTitle: ticket.title,
                    experienceImage: "some image path",
                    eventType: ExperienceEventTypeEnum.ONLINE,
                    ticketName: ticket.title,
                    startTime: ticket.session.startTime,
                    endTime: ticket.session.endTime,
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
                    userId,
                    orderDetailId: orderDetail.id,
                    ticketCode: "12345678",
                    assignedUserId: userId,
                    assignedAt: new Date(),
                })
            }

            const session = await ExperienceSessionDbModel.findOne({
                where: { experienceId }
            }) as any;

            const experienceOnlineEventLink = await request(app)
                .get(`/api/v1/experiences/${session.id + 100}/${ticketCode}/online-event-link`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(experienceOnlineEventLink.statusCode).toEqual(400);
            expect(experienceOnlineEventLink.body.error.message).toBe('Experience session is not found');
        });

        it('Get online event link: return 400 Experience is not found', async () => {            
            let createExperienceRes = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(experienceData) as any;
            experienceIds.push(createExperienceRes.body.data.id);

            expect(createExperienceRes.statusCode).toEqual(200);

            const experienceId = createExperienceRes.body.data.id;

            const experienceSessions = await ExperienceSessionDbModel.findAll({
                where: { experienceId }
            }) as any;

            const experienceSessionTickets = await ExperienceSessionTicketDbModel.findAll({
                where: { sessionId: experienceSessions.map((x: any) => x.id) },
                include: [{ model: ExperienceSessionDbModel, as: "session" }]
            }) as any

            const order = await ExperienceOrderDbModel.create({
                code: "12345678",
                userId,
                paymentIntentId: "someIntentId",
                paymentTransactionId: 1,
                status: ExperienceOrderStatusEnum.COMPLETED,
                amount: 1000,
                usedCoins: 0,
                totalAmount: 1000,
                fiatAmount: 1000,
                earnedCoins: 10,
                shopId: shop.id,
                shopTitle: shop.nameId,
                shopEmail: shop.email,
                anonymous: false,
                purchaseTimezone: 'Asia/Ho_Chi_Minh',
                orderedAt: new Date(),
            }) as any;

            for await (const ticket of experienceSessionTickets) {
                const orderDetail = await ExperienceOrderDetailDbModel.create({
                    orderId: order.id,
                    experienceId,
                    sessionId: ticket.sessionId,
                    sessionTicketId: ticket.id,
                    experienceTitle: ticket.title,
                    experienceImage: "some image path",
                    eventType: ExperienceEventTypeEnum.ONLINE,
                    ticketName: ticket.title,
                    startTime: ticket.session.startTime,
                    endTime: ticket.session.endTime,
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
                    userId,
                    orderDetailId: orderDetail.id,
                    ticketCode: "12345678",
                    assignedUserId: userId,
                    assignedAt: new Date(),
                })
            }

            const session = await ExperienceSessionDbModel.findOne({
                where: { experienceId }
            }) as any;

            await ExperienceSessionDbModel.update({experienceId: experienceId + 1}, {
                where: {
                    id: session.id
                }
            })

            const experienceOnlineEventLink = await request(app)
                .get(`/api/v1/experiences/${session.id}/${ticketCode}/online-event-link`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(experienceOnlineEventLink.statusCode).toEqual(400);
            expect(experienceOnlineEventLink.body.error.message).toBe('Experience is not found');
        });

        it('Get online event link: return 400 unpublished experience', async () => {

            let createExperienceRes = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(experienceData) as any;
            experienceIds.push(createExperienceRes.body.data.id);

            expect(createExperienceRes.statusCode).toEqual(200);

            const experienceId = createExperienceRes.body.data.id;

            const experienceSessions = await ExperienceSessionDbModel.findAll({
                where: { experienceId }
            }) as any;

            const experienceSessionTickets = await ExperienceSessionTicketDbModel.findAll({
                where: { sessionId: experienceSessions.map((x: any) => x.id) },
                include: [{ model: ExperienceSessionDbModel, as: "session" }]
            }) as any

            const order = await ExperienceOrderDbModel.create({
                code: "12345678",
                userId,
                paymentIntentId: "someIntentId",
                paymentTransactionId: 1,
                status: ExperienceOrderStatusEnum.COMPLETED,
                amount: 1000,
                usedCoins: 0,
                totalAmount: 1000,
                fiatAmount: 1000,
                earnedCoins: 10,
                shopId: shop.id,
                shopTitle: shop.nameId,
                shopEmail: shop.email,
                anonymous: false,
                purchaseTimezone: 'Asia/Ho_Chi_Minh',
                orderedAt: new Date(),
            }) as any;

            for await (const ticket of experienceSessionTickets) {
                const orderDetail = await ExperienceOrderDetailDbModel.create({
                    orderId: order.id,
                    experienceId,
                    sessionId: ticket.sessionId,
                    sessionTicketId: ticket.id,
                    experienceTitle: ticket.title,
                    experienceImage: "some image path",
                    eventType: ExperienceEventTypeEnum.ONLINE,
                    ticketName: ticket.title,
                    startTime: ticket.session.startTime,
                    endTime: ticket.session.endTime,
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
                    userId,
                    orderDetailId: orderDetail.id,
                    ticketCode: "12345678",
                    assignedUserId: userId,
                    assignedAt: new Date(),
                })
            }

            const session = await ExperienceSessionDbModel.findOne({
                where: { experienceId }
            }) as any;

            const experienceOnlineEventLink = await request(app)
                .get(`/api/v1/experiences/${session.id}/${ticketCode}/online-event-link`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(experienceOnlineEventLink.statusCode).toEqual(400);
            expect(experienceOnlineEventLink.body.error.message).toBe('Experience is not found');
        });

        it('Get online event link: return 409 TicketCodeDoesNotExist', async () => {

            let createExperienceRes = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(experienceData) as any;
            experienceIds.push(createExperienceRes.body.data.id);

            expect(createExperienceRes.statusCode).toEqual(200);

            const experienceId = createExperienceRes.body.data.id;

            await ExperienceDbModel.update({ status: ExperienceStatusEnum.PUBLISHED }, { where: { id: experienceId } });

            const experienceSessions = await ExperienceSessionDbModel.findAll({
                where: { experienceId }
            }) as any;

            const experienceSessionTickets = await ExperienceSessionTicketDbModel.findAll({
                where: { sessionId: experienceSessions.map((x: any) => x.id) },
                include: [{ model: ExperienceSessionDbModel, as: "session" }]
            }) as any

            const order = await ExperienceOrderDbModel.create({
                code: "12345678",
                userId,
                paymentIntentId: "someIntentId",
                paymentTransactionId: 1,
                status: ExperienceOrderStatusEnum.COMPLETED,
                amount: 1000,
                usedCoins: 0,
                totalAmount: 1000,
                fiatAmount: 1000,
                earnedCoins: 10,
                shopId: shop.id,
                shopTitle: shop.nameId,
                shopEmail: shop.email,
                anonymous: false,
                purchaseTimezone: 'Asia/Ho_Chi_Minh',
                orderedAt: new Date(),
            }) as any;

            for await (const ticket of experienceSessionTickets) {
                const orderDetail = await ExperienceOrderDetailDbModel.create({
                    orderId: order.id,
                    experienceId,
                    sessionId: ticket.sessionId,
                    sessionTicketId: ticket.id,
                    experienceTitle: ticket.title,
                    experienceImage: "some image path",
                    eventType: ExperienceEventTypeEnum.ONLINE,
                    ticketName: ticket.title,
                    startTime: ticket.session.startTime,
                    endTime: ticket.session.endTime,
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
                    userId,
                    orderDetailId: orderDetail.id,
                    ticketCode: "12345678",
                    assignedUserId: userId,
                    assignedAt: new Date(),
                })
            }

            const session = await ExperienceSessionDbModel.findOne({
                where: { experienceId }
            }) as any;

            const experienceOnlineEventLink = await request(app)
                .get(`/api/v1/experiences/${session.id}/${12345679}/online-event-link`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(experienceOnlineEventLink.statusCode).toEqual(409);
            expect(experienceOnlineEventLink.body.error.message).toBe('TicketCodeDoesNotExist');
        });

        it('Get online event link: return 403 invalid assigned user id', async () => {

            let createExperienceRes = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(experienceData) as any;
            experienceIds.push(createExperienceRes.body.data.id);

            expect(createExperienceRes.statusCode).toEqual(200);

            const experienceId = createExperienceRes.body.data.id;

            await ExperienceDbModel.update({ status: ExperienceStatusEnum.PUBLISHED }, { where: { id: experienceId } });

            const experienceSessions = await ExperienceSessionDbModel.findAll({
                where: { experienceId }
            }) as any;

            const session = await ExperienceSessionDbModel.findOne({
                where: { experienceId }
            }) as any;

            const experienceSessionTickets = await ExperienceSessionTicketDbModel.findAll({
                where: { sessionId: experienceSessions.map((x: any) => x.id) },
                include: [{ model: ExperienceSessionDbModel, as: "session" }]
            }) as any

            const order = await ExperienceOrderDbModel.create({
                code: 's0mEH3nG',
                userId: 9999,
                paymentIntentId: "someIntentId",
                paymentTransactionId: 1,
                status: ExperienceOrderStatusEnum.COMPLETED,
                amount: 1000,
                usedCoins: 0,
                totalAmount: 1000,
                fiatAmount: 1000,
                earnedCoins: 10,
                shopId: shop.id,
                shopTitle: shop.nameId,
                shopEmail: shop.email,
                anonymous: false,
                purchaseTimezone: 'Asia/Ho_Chi_Minh',
                orderedAt: new Date(),
            }) as any;

            for await (const ticket of experienceSessionTickets) {
                const orderDetail = await ExperienceOrderDetailDbModel.create({
                    orderId: order.id,
                    experienceId,
                    sessionId: session.id,
                    sessionTicketId: ticket.id,
                    experienceTitle: ticket.title,
                    experienceImage: "some image path",
                    eventType: ExperienceEventTypeEnum.ONLINE,
                    ticketName: ticket.title,
                    startTime: ticket.session.startTime,
                    endTime: ticket.session.endTime,
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
                    ticketCode: 's0mEH3nG',
                    assignedUserId: 9998,
                    assignedAt: new Date(),
                })
            }

            const experienceOnlineEventLink = await request(app)
                .get(`/api/v1/experiences/${session.id}/${'s0mEH3nG'}/online-event-link`)
                .set('Authorization', `Bearer ${userToken}`);
                
            expect(experienceOnlineEventLink.statusCode).toEqual(403);
            expect(experienceOnlineEventLink.body.error.message).toBe('InvalidTicketOwner');
        });

        it('Get online event link: return 200', async () => {

            let createExperienceRes = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(experienceData) as any;
            experienceIds.push(createExperienceRes.body.data.id);

            expect(createExperienceRes.statusCode).toEqual(200);

            const experienceId = createExperienceRes.body.data.id;

            await ExperienceDbModel.update({ status: ExperienceStatusEnum.PUBLISHED }, { where: { id: experienceId } });

            const experienceSessions = await ExperienceSessionDbModel.findAll({
                where: { experienceId }
            }) as any;

            const experienceSessionTickets = await ExperienceSessionTicketDbModel.findAll({
                where: { sessionId: experienceSessions.map((x: any) => x.id) },
                include: [{ model: ExperienceSessionDbModel, as: "session" }]
            }) as any

            const order = await ExperienceOrderDbModel.create({
                code: 's0mEH2nG',
                userId: 9999,
                paymentIntentId: "someIntentId",
                paymentTransactionId: 1,
                status: ExperienceOrderStatusEnum.COMPLETED,
                amount: 1000,
                usedCoins: 0,
                totalAmount: 1000,
                fiatAmount: 1000,
                earnedCoins: 10,
                shopId: shop.id,
                shopTitle: shop.nameId,
                shopEmail: shop.email,
                anonymous: false,
                purchaseTimezone: 'Asia/Ho_Chi_Minh',
                orderedAt: new Date(),
            }) as any;

            const session = await ExperienceSessionDbModel.findOne({
                where: { experienceId }
            }) as any;

            for await (const ticket of experienceSessionTickets) {
                const orderDetail = await ExperienceOrderDetailDbModel.create({
                    orderId: order.id,
                    experienceId,
                    sessionId: session.id,
                    sessionTicketId: ticket.id,
                    experienceTitle: ticket.title,
                    experienceImage: "some image path",
                    eventType: ExperienceEventTypeEnum.ONLINE,
                    ticketName: ticket.title,
                    startTime: ticket.session.startTime,
                    endTime: ticket.session.endTime,
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
                    ticketCode: 's0mEH2nG',
                    assignedUserId: 9999,
                    assignedAt: new Date(),
                })
            }

            const experienceOnlineEventLink = await request(app)
                .get(`/api/v1/experiences/${session.id}/${'s0mEH2nG'}/online-event-link`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(experienceOnlineEventLink.statusCode).toEqual(200);
            expect(experienceOnlineEventLink.body.data.eventLink).toEqual('https://example.com');
        });
    })
}
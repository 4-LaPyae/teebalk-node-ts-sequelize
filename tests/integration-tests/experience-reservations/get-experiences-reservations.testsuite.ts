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
    ExperienceTicketDbModel,
    ExperienceTransparencyDbModel,
    IExperienceSessionModel,
    ShopDbModel,
    ShopImageDbModel
} from "../../../src/database";
import { createTestShop } from "../helpers";

const request = require('supertest');
const app = require('../index');

export const getExperienceReservationsTest = () => {
    describe('GET EXPERIENCE RESERVATIONS', () => {

        let shop: any;
        let userId = 9999;
        let experienceData: any;
        let experienceIds: number[] = [];
        const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIwLCJpYXQiOjE2MzkzNzc5MTgsImV4cCI6MTYzOTQ2NDMxOH0.ak4Xvgc0Xn31TU3fh5AEWrsFPhsvj0Pyr3_SQfZdclA';

        beforeAll(async () => {

            shop = await createTestShop();

            const sessionStartTime = new Date();
            const sessionEndTime = new Date();
            sessionEndTime.setHours(sessionEndTime.getHours() + 4);

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
                            startTime: sessionStartTime.toISOString(),
                            endTime: sessionEndTime.toISOString(),
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

            await ShopImageDbModel.destroy({
                where: { shopId: shop.id },
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

        it('get upcoming should return ok', async () => {

            let createExperienceRes = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(experienceData) as any;
            experienceIds.push(createExperienceRes.body.data.id);

            expect(createExperienceRes.statusCode).toEqual(200);

            const experienceId = createExperienceRes.body.data.id;

            await request(app)
                .patch(`/api/v1/experiences/${experienceId}/publish`)
                .set('Authorization', `Bearer ${userToken}`);

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

            const experienceReservations = await request(app)
                .get(`/api/v1/experiences/reservations/upcoming`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(experienceReservations.statusCode).toEqual(200);
            expect(experienceReservations.body.count).toEqual(1);

            experienceIds.push(createExperienceRes.body.data.id);

            const orders = experienceReservations.body.data;

            expect(orders.length).toEqual(1);
            expect(experienceReservations.body.metadata).not.toBeUndefined();
            expect(orders[0].tickets.length).toEqual(2);
            expect(orders[0].experience).not.toBeUndefined();
            expect(orders[0].shop).not.toBeUndefined();
            expect(orders[0].session).not.toBeUndefined();

            const firstTicket = orders[0].tickets[0];
            expect(firstTicket.ticketCode).not.toBeUndefined();
            expect(firstTicket.price).not.toBeUndefined();
            expect(firstTicket.totalPrice).not.toBeUndefined();
            expect(firstTicket.priceWithTax).not.toBeUndefined();
        });

        it('get upcoming should return ok with deleted tickets', async () => {
            const experienceSessions = await ExperienceSessionDbModel.findAll({
                where: { experienceId: experienceIds[0] }
            }) as any;

            const sessionIds = experienceSessions.map((expSession: IExperienceSessionModel) => expSession.id);

            await Promise.all([
                ExperienceSessionDbModel.destroy({ where: { id: sessionIds } }),
                ExperienceSessionTicketDbModel.destroy({ where: { sessionId: sessionIds } })
            ]);
            
            const experienceReservations = await request(app)
                .get(`/api/v1/experiences/reservations/upcoming`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(experienceReservations.statusCode).toEqual(200);
            expect(experienceReservations.body.count).toEqual(1);

            const orders = experienceReservations.body.data;

            expect(orders.length).toEqual(1);
            expect(experienceReservations.body.metadata).not.toBeUndefined();
            expect(orders[0].tickets.length).toEqual(2);
            expect(orders[0].experience).not.toBeUndefined();
            expect(orders[0].shop).not.toBeUndefined();
            expect(orders[0].session).not.toBeUndefined();

            const firstTicket = orders[0].tickets[0];
            expect(firstTicket.title).not.toBeNull();
            expect(firstTicket.title).not.toBeUndefined();
            expect(firstTicket.ticketCode).not.toBeUndefined();
            expect(firstTicket.price).not.toBeUndefined();
            expect(firstTicket.totalPrice).not.toBeUndefined();
            expect(firstTicket.priceWithTax).not.toBeUndefined();
        });

        it('get completed should return ok', async () => {

            const pastSessions =
                [
                    {
                        defaultTimezone: "Asia/Tokyo",
                        startTime: "2022-04-15 18:45:37",
                        endTime: "2022-04-15 18:45:37",
                        tickets: [
                            {
                                title: "Adult",
                                price: 1000,
                                quantity: 5,
                                availableUntilMins: 5,
                               
                                
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
                                
                                eventLink: "https://example.com",
                                eventPassword: "abc",
                                enable: false,
                                online: true,
                                offline: false
                            }
                        ]
                    }
                ]

            let createExperienceRes = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    ...experienceData,
                    sessions: pastSessions
                }) as any;

            expect(createExperienceRes.statusCode).toEqual(200);

            const experienceId = createExperienceRes.body.data.id;

            await request(app)
                .patch(`/api/v1/experiences/${experienceId}/publish`)
                .set('Authorization', `Bearer ${userToken}`);

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

            const experienceReservations = await request(app)
                .get(`/api/v1/experiences/reservations/completed`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(experienceReservations.statusCode).toEqual(200);
            expect(experienceReservations.body.count).toEqual(1);

            experienceIds.push(createExperienceRes.body.data.id);

            const orders = experienceReservations.body.data;

            expect(orders.length).toEqual(1);
            expect(orders[0].tickets.length).toEqual(2);
            expect(orders[0].experience).not.toBeUndefined();
            expect(orders[0].shop).not.toBeUndefined();
            expect(orders[0].session).not.toBeUndefined();

            const firstTicket = orders[0].tickets[0];
            expect(firstTicket.ticketCode).not.toBeUndefined();
            expect(firstTicket.price).not.toBeUndefined();
            expect(firstTicket.totalPrice).not.toBeUndefined();
            expect(firstTicket.priceWithTax).not.toBeUndefined();
        })

        it('get experience reservation total should return ok', async () => {
            const totalRes = await request(app)
                .get(`/api/v1/experiences/reservations/total`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(totalRes.statusCode).toEqual(200);
            expect(totalRes.body.data.upcoming).toEqual(1);
            expect(totalRes.body.data.completed).toEqual(1);
        })
    })
}
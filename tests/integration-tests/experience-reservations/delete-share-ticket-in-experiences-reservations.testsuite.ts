import { Op } from "sequelize";
import { ExperienceSessionTicketReservationLinkRepository, ExperienceSessionTicketReservationRepository } from "../../../src/dal";
import {
    ExperienceEventTypeEnum,
    ExperienceOrderDbModel,
    ExperienceOrderDetailDbModel,
    ExperienceOrderStatusEnum,
    ExperienceSessionDbModel,
    ExperienceSessionTicketDbModel,
    ExperienceSessionTicketReservationDbModel
} from "../../../src/database";
import { generateNameId } from '../../../src/helpers';
import { clearTestExperienceDataByUserId, clearTestShopDataById, createTestShop } from "../helpers";
const request = require('supertest');
const app = require('../index');

export const cancelSharedTicketInExperienceReservationsTest = () => {
    describe('DELETE SHARE TICKET EXPERIENCE RESERVATIONS', () => {
        const experienceSessionTicketReservationRepository = new ExperienceSessionTicketReservationRepository();
        const experienceSessionTicketReservationLinkRepository = new ExperienceSessionTicketReservationLinkRepository();

        let shop: any;
        let userId = 9999;
        let experienceData: any;
        let experienceIds: number[] = [];
        const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIwLCJpYXQiOjE2MzkzNzc5MTgsImV4cCI6MTYzOTQ2NDMxOH0.ak4Xvgc0Xn31TU3fh5AEWrsFPhsvj0Pyr3_SQfZdclA';
        const ticketCodeData = generateNameId(8);
        beforeAll(async () => {
            shop = await createTestShop();

            experienceData = {
                title: 'new experience 1',
                categoryId: 1,
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
                        position: 2,
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
                                    offline: true,
                                    position: 1
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
                                    offline: false,
                                    position: 2
                                }
                            ]
                        }
                    ],
                cancelPolicy: '<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<',
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
                images: [{
                    id: 0,
                    experienceId: 0,
                    imageDescription: "image description",
                    imagePath: "some image path",
                    position: 1,

                }]
            };

            let createExperienceRes = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(experienceData) as any;

            expect(createExperienceRes.statusCode).toEqual(200);

            const experienceId = createExperienceRes.body.data.id;
            experienceIds.push(experienceId);

            // await request(app)
            //     .patch(`/api/v1/experiences/${experienceId}/publish`)
            //     .set('Authorization', `Bearer ${userToken}`);

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
                    ticketCode: ticketCodeData,
                    assignedUserId: userId,
                    assignedAt: new Date(),
                })
            }
        })

        afterAll(async () => {
            await clearTestExperienceDataByUserId(userId)
            await clearTestShopDataById([shop.id]);
        })

        it('should get return error 403 ticket not exist', async () => {
            const experienceId = experienceIds[0];
            
            const experienceSessions = await ExperienceSessionDbModel.findAll({
                where: { experienceId }
            }) as any;

            const ticketCodeId = generateNameId(8);

            const experienceReservations = await request(app)
                .patch(`/api/v1/experiences/reservations/${ticketCodeId}/cancel`)
                .send({
                    sessionId: experienceSessions[0].id,
                    ticketCode: [ticketCodeId]
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(experienceReservations.statusCode).toEqual(403);
            expect(experienceReservations.body.error.message).toBe('InvalidTicketOwner');
        });

        it('should cancel share ticket ', async () => {
            const experienceId = experienceIds[0];
            
            const experienceSessions = await ExperienceSessionDbModel.findAll({
                where: { experienceId }
            }) as any;
            
            const experienceReservations = await request(app)
                .patch(`/api/v1/experiences/reservations/${ticketCodeData}/cancel`)
                .send({
                    sessionId: experienceSessions[0].id,
                    ticketCode: [ticketCodeData]
                })
                .set('Authorization', `Bearer ${userToken}`);

            expect(experienceReservations.statusCode).toEqual(200);
            const reservationData = await experienceSessionTicketReservationRepository.findOne({
                 where: { [Op.and]: [{ userId }, { ticketCode: ticketCodeData }] }
              });
            const reservationLinkData = await experienceSessionTicketReservationLinkRepository.findOne({
                where: { [Op.and]: [{ reservationId: reservationData.id }, { available: true }] }
              });
            expect(reservationData.assignedUserId).toEqual(null);
            expect(reservationData.assignedAt).toEqual(null);
            expect(reservationLinkData.nameId).not.toEqual(ticketCodeData);
        });
    })
}
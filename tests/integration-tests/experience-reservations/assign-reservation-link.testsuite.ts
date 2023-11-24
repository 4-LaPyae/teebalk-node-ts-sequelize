import {
    ExperienceDbModel,
    ExperienceOrderDetailDbModel,
    ExperienceSessionDbModel,
    ExperienceSessionTicketDbModel,
    ExperienceSessionTicketReservationDbModel,
    ExperienceSessionTicketReservationLinkDbModel,
    ExperienceStatusEnum,
    ExperienceTicketDbModel,
    IExperienceSessionTicketReservationModel,
    ShopDbModel,
    ShopStatusEnum
} from "../../../src/database";

const request = require('supertest');
const app = require('../index');

export const assignReservationLinkTest = () => {
    describe('ASSIGN RESERVATION LINK', () => {

        let shop: any;
        let sequenceNumber = 0;
        const orderId = 9999;
        const loggedInUserId = 9999;
        const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIwLCJpYXQiOjE2MzkzNzc5MTgsImV4cCI6MTYzOTQ2NDMxOH0.ak4Xvgc0Xn31TU3fh5AEWrsFPhsvj0Pyr3_SQfZdclA';

        const createTestData = async (experienceStatus: ExperienceStatusEnum, reservationLinkNameId: string, ownerUserId: number, assignedUserId?: number) => {
            const experience = await ExperienceDbModel.create<any>({
                nameId: `test-experience-name-${sequenceNumber}`,
                shopId: shop.id,
                userId: ownerUserId,
                status: experienceStatus,
                publishedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const experienceSession = await ExperienceSessionDbModel.create<any>({
                experienceId: experience.id,
                startTime: new Date(),
                endTime: new Date(),
                defaultTimezone: 'UTC',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const ticket = await ExperienceTicketDbModel.create<any>({
                experienceId: experience.id,
                title: 'test-ticket',
                price: 1100,
                free: false,
                quantity: 10,
                availableUntilMins: 1000,
                online: true,
                offline: false,
                position: 1,
                reflectChange: true
            });

            const sessionTicket = await ExperienceSessionTicketDbModel.create<any>({
                sessionId: experienceSession.id,
                ticketId: ticket.id,
                enable: true,
                title: 'test-session-ticket',
                price: 1100,
                quantity: 10,
                availableUntilMins: 1000,
                online: true,
                offline: false,
                position: 1,
                availableUntilDate: new Date()
            });

            const orderDetail = await ExperienceOrderDetailDbModel.create<any>({
                orderId: orderId,
                experienceId: experience.id,
                sessionId: experienceSession.id,
                sessionTicketId: sessionTicket.id,
                experienceTitle: 'test-title',
                experienceImage: 'test-image',
                ticketName: 'test-ticket-name',
                startTime: new Date(),
                endTime: new Date(),
                defaultTimezone: 'UTC',
                online: true,
                offline: false,
                price: 1000,
                priceWithTax: 1100,
                quantity: 10,
                totalPrice: 11000
            });

            const ticketReservation = await ExperienceSessionTicketReservationDbModel.create<any>({
                userId: ownerUserId,
                orderDetailId: orderDetail.id,
                ticketCode: `test-ticket-code-${sequenceNumber}`,
                assignedUserId: assignedUserId,
                assignedAt: assignedUserId ? new Date() : null
            });

            await ExperienceSessionTicketReservationLinkDbModel.create<any>({
                reservationId: ticketReservation.id,
                nameId: reservationLinkNameId,
                available: true
            });

            sequenceNumber++;

            return {
                ticketReservationId: ticketReservation.id
            };
        };

        beforeAll(async () => {
            const shopData = {
                nameId: 'test-shop',
                userId: 999,
                isFeatured: true,
                status: ShopStatusEnum.PUBLISHED,
                email: 'test@email.com',
                experiencePlatformPercents: 50,

            };

            shop = await ShopDbModel.create(shopData);
        });

        afterAll(async () => {
            const createdExperiencesList = await ExperienceDbModel.findAll({
                where: {
                    shopId: shop.id
                },
                attributes: ['id']
            });

            const createdOrderDetails = await ExperienceOrderDetailDbModel.findAll({
                where: {
                    orderId: orderId
                },
                attributes: ['id']
            });

            const createdExperienceIds: number[] = createdExperiencesList.map((item: any) => item.id);

            const createdSessionList = await ExperienceSessionDbModel.findAll({
                where: {
                  experienceId: createdExperienceIds
                },
                attributes: ['id'],
                paranoid: false
              });

            const sessionIds: number[] = createdSessionList.map(item => {
            return (item as any).id;
            });

            const createdOrderDetailIds: number[] = createdOrderDetails.map((item: any) => item.id);

            const createdTicketReservations = await ExperienceSessionTicketReservationDbModel.findAll({
                where: {
                    orderDetailId: createdOrderDetailIds
                },
                attributes: ['id']
            });

            const createdTicketReservationIds: number[] = createdTicketReservations.map((item: any) => item.id);

            await ShopDbModel.destroy({
                where: { id: shop.id },
                force: true
            });

            await ExperienceDbModel.destroy({
                where: { shopId: shop.id },
                force: true
            });

            await ExperienceSessionDbModel.destroy({
                where: { experienceId: createdExperienceIds },
                force: true
            });

            await ExperienceTicketDbModel.destroy({
                where: { experienceId: createdExperienceIds },
                force: true
            });

            await ExperienceSessionTicketDbModel.destroy({
                where: { sessionId: sessionIds },
                force: true
            });

            await ExperienceOrderDetailDbModel.destroy({
                where: { orderId: orderId },
                force: true
            });

            await ExperienceSessionTicketReservationDbModel.destroy({
                where: { id: createdTicketReservationIds },
                force: true
            });

            await ExperienceSessionTicketReservationLinkDbModel.destroy({
                where: { reservationId: createdTicketReservationIds },
                force: true
            });
        });

        it('invalid Link, should return 400 error', async () => {
            const requestData = {
                reservationLinkNameIds: ['invalidid']
            };

            const response = await request(app)
                .post(`/api/v1/experiences/reservations/assign-link`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(requestData) as any;

            expect(response.statusCode).toEqual(400);
            expect(response.body.error).toBeDefined();
            expect(response.body.error.message).toEqual('LinkNotFound');
        });

        it('request contains more than 1 link, should return 400 error', async () => {
            const requestData = {
                reservationLinkNameIds: ['link1', 'link2']
            };

            const response = await request(app)
                .post(`/api/v1/experiences/reservations/assign-link`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(requestData) as any;

            expect(response.statusCode).toEqual(400);
            expect(response.body.error).toBeDefined();
        });

        it('session not found, should return error', async () => {
            const reservationLinkNameId = `test-link-${sequenceNumber}`;

            await createTestData(ExperienceStatusEnum.UNPUBLISHED, reservationLinkNameId, 999);

            const requestData = {
                reservationLinkNameIds: [reservationLinkNameId]
            };

            const response = await request(app)
                .post(`/api/v1/experiences/reservations/assign-link`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(requestData) as any;

            expect(response.body.data).toBeDefined();
            expect(response.body.data.error).toEqual('ExperienceNotAvailable');
        });

        it('link already assigned, should return error', async () => {
            const reservationLinkNameId = `test-link-${sequenceNumber}`;

            await createTestData(ExperienceStatusEnum.PUBLISHED, reservationLinkNameId, 999, 300);

            const requestData = {
                reservationLinkNameIds: [reservationLinkNameId]
            };

            const response = await request(app)
                .post(`/api/v1/experiences/reservations/assign-link`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(requestData) as any;

            expect(response.body.data).toBeDefined();
            expect(response.body.data.error).toEqual('LinkAlreadyAssigned');
        });

        it('assign to ticket owner, should return error', async () => {
            const reservationLinkNameId = `test-link-${sequenceNumber}`;

            await createTestData(ExperienceStatusEnum.PUBLISHED, reservationLinkNameId, loggedInUserId);

            const requestData = {
                reservationLinkNameIds: [reservationLinkNameId]
            };

            const response = await request(app)
                .post(`/api/v1/experiences/reservations/assign-link`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(requestData) as any;

            expect(response.body.data).toBeDefined();
            expect(response.body.data.error).toEqual('UserIsOwner');
        });

        it('all data correct, should return ok', async () => {
            const reservationLinkNameId = `test-link-${sequenceNumber}`;

            const createdData = await createTestData(ExperienceStatusEnum.PUBLISHED, reservationLinkNameId, 999);

            const requestData = {
                reservationLinkNameIds: [reservationLinkNameId]
            };

            const response = await request(app)
                .post(`/api/v1/experiences/reservations/assign-link`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(requestData) as any;

            const updatedTicketReservation: IExperienceSessionTicketReservationModel = await ExperienceSessionTicketReservationDbModel.findOne<any>({
                where: {
                    id: createdData.ticketReservationId
                }
            });

            expect(response.statusCode).toEqual(200);
            expect(response.body.data).toBeDefined();
            expect(response.body.data).toEqual(true);

            expect(updatedTicketReservation.assignedUserId).toEqual(loggedInUserId);
            expect(updatedTicketReservation.updatedAt).toBeDefined();
        });
    })
}

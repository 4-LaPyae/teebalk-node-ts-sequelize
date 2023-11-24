import { generateNameId } from '../../../src/helpers';
import { ExperienceDbModel, ExperienceOrderManagementDbModel, ExperienceSessionDbModel, ExperienceSessionTicketDbModel, ExperienceStatusEnum, ShopDbModel, ShopStatusEnum } from "../../../src/database";
import { clearTestExperienceDataByUserId, clearTestShopDataById } from "../helpers";

const request = require('supertest');
const app = require('../index');
const userToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIwLCJpYXQiOjE2MzkzNzc5MTgsImV4cCI6MTYzOTQ2NDMxOH0.ak4Xvgc0Xn31TU3fh5AEWrsFPhsvj0Pyr3_SQfZdclA';

export const testCreateFreeTicketsOrder = () =>
  describe('experience checkout - Create free tickets order', () => {
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
                      price: 0,
                      quantity: 111,
                      reflectChange: false,
                      title: "ticket 1"
                  },
                  {
                      availableUntilMins: 2880,
                      
                      free: false,
                      id: 0,
                      offline: false,
                      online: true,
                      price: 0,
                      quantity: 111,
                      reflectChange: false,
                      title: "ticket 2"
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
                              price: 0,
                              quantity: 111,
                              title: "ticket 1"
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
                              price: 0,
                              quantity: 111,
                              title: "ticket 2"
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
                              price: 0,
                              quantity: 111,
                              title: "ticket 1"
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
                              price: 0,
                              quantity: 111,
                              title: "ticket 2"
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

    describe('create_free_ticket_order', () => {
      describe('create_experience_free_tickets_order_fail', () => {
        it('Miss Experience Name Id, should get return 400 error', async () => {
          const userShippingAddressData = {
            sessionId: 14,
            startTime: '2022-05-25 00:00:00',
            endTime: '2022-05-25 03:00:00',
            amount: 0,
            purchaseTimezone: 'Asia/Ho_Chi_Minh',
            tickets: []
        };

          const res = await request(app)
            .post(`/api/v1/experience/checkout/reserve-free-tickets`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(userShippingAddressData);

          expect(res.statusCode).toEqual(400);
          expect(res.body.error.message).toBe(`"experienceNameId" is required`);
        });

        it('Miss Experience Title, should get return 400 error', async () => {
            const userShippingAddressData = {
              experienceNameId: 'Ex36STHloJpQIUvfDFTgf3DT3wXUhf',
              sessionId: 14,
              startTime: '2022-05-25 00:00:00',
              endTime: '2022-05-25 03:00:00',
              amount: 3500,
              purchaseTimezone: 'Asia/Ho_Chi_Minh',
              tickets: []
          };
  
            const res = await request(app)
              .post(`/api/v1/experience/checkout/reserve-free-tickets`)
              .set('Authorization', `Bearer ${userToken}`)
              .send(userShippingAddressData);
  
            expect(res.statusCode).toEqual(400);
            expect(res.body.error.message).toBe(`"experienceTitle" is required`);
          });

        it('Invalid date value, should get return 400 error', async () => {
          const userShippingAddressData = {
            experienceNameId: 'Ex36STHloJpQIUvfDFTgf3DT3wXUhf',
            experienceTitle: 'Test',
            sessionId: 14,
            startTime: '2022-05-25 00',
            endTime: '2022-05-25 03:00:00',
            amount: 0,
            purchaseTimezone: 'Asia/Ho_Chi_Minh',
            tickets: []
        };

          const res = await request(app)
            .post(`/api/v1/experience/checkout/reserve-free-tickets`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(userShippingAddressData);

          expect(res.statusCode).toEqual(400);
          expect(res.body.error.message).toBe(`"startTime" must be a valid ISO 8601 date`);
        });

        it('Ticket list is empty, should get return 400 error', async () => {
          const userShippingAddressData = {
            experienceNameId: 'Ex36STHloJpQIUvfDFTgf3DT3wXUhf',
            experienceTitle: 'Test',
            sessionId: 14,
            startTime: '2022-05-25 00:00:00',
            endTime: '2022-05-25 03:00:00',
            amount: 0,
            purchaseTimezone: 'Asia/Ho_Chi_Minh',
            tickets: []
        };

          const res = await request(app)
            .post(`/api/v1/experience/checkout/reserve-free-tickets`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(userShippingAddressData);

          expect(res.statusCode).toEqual(400);
          expect(res.body.error.message).toBe(`"tickets" must contain at least 1 items`);
        });

        it('amount is not 0, should get return 400 error', async () => {
          const userShippingAddressData = {
            experienceNameId: 'Ex36STHloJpQIUvfDFTgf3DT3wXUhf',
            experienceTitle: 'Test',
            sessionId: 14,
            startTime: '2022-05-25 00:00:00',
            endTime: '2022-05-25 03:00:00',
            amount: 49,
            purchaseTimezone: 'Asia/Ho_Chi_Minh',
            tickets: [
              {
                ticketId: 1,
                purchaseQuantity: 1,
                price: 0,
                amount: 0
              }
            ]
        };

          const res = await request(app)
            .post(`/api/v1/experience/checkout/reserve-free-tickets`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(userShippingAddressData);

          expect(res.statusCode).toEqual(400);
          expect(res.body.error.message).toBe(`"amount" must be one of [0]`);
        });

        it('invalid ticket detail, should get return 400 error', async () => {
          const userShippingAddressData = {
            experienceNameId: 'Ex36STHloJpQIUvfDFTgf3DT3wXUhf',
            experienceTitle: 'Test',
            sessionId: 14,
            startTime: '2022-05-25 00:00:00',
            endTime: '2022-05-25 03:00:00',
            amount: 0,
            purchaseTimezone: 'Asia/Ho_Chi_Minh',
            tickets: [
              {
                purchaseQuantity: 1,
                price: 0,
                amount: 0
              }
            ]
        };

          const res = await request(app)
            .post(`/api/v1/experience/checkout/reserve-free-tickets`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(userShippingAddressData);

          expect(res.statusCode).toEqual(400);
          expect(res.body.error.message).toBe(`"ticketId" is required`);
        });

        it('invalid ticket detail, should get return 400 error', async () => {
            const userShippingAddressData = {
              experienceNameId: 'Ex36STHloJpQIUvfDFTgf3DT3wXUhf',
              experienceTitle: 'Test',
              sessionId: 14,
              startTime: '2022-05-25 00:00:00',
              endTime: '2022-05-25 03:00:00',
              amount: 0,
              purchaseTimezone: 'Asia/Ho_Chi_Minh',
              tickets: [
                {
                  ticketId: 12,
                  purchaseQuantity: 1,
                  price: 0,
                  amount: 0
                }
              ]
          };
  
            const res = await request(app)
              .post(`/api/v1/experience/checkout/reserve-free-tickets`)
              .set('Authorization', `Bearer ${userToken}`)
              .send(userShippingAddressData);
  
            expect(res.statusCode).toEqual(400);
            expect(res.body.error.message).toBe(`"ticketTitle" is required`);
        });

        it('invalid ticket detail, should get return 400 error', async () => {
            const userShippingAddressData = {
              experienceNameId: 'Ex36STHloJpQIUvfDFTgf3DT3wXUhf',
              experienceTitle: 'Test',
              sessionId: 14,
              startTime: '2022-05-25 00:00:00',
              endTime: '2022-05-25 03:00:00',
              amount: 0,
              purchaseTimezone: 'Asia/Ho_Chi_Minh',
              tickets: [
                {
                  ticketId: 12,
                  ticketTitle: 'Test',
                  purchaseQuantity: 1,
                  price: 0,
                  amount: 0
                }
              ]
          };
  
            const res = await request(app)
              .post(`/api/v1/experience/checkout/reserve-free-tickets`)
              .set('Authorization', `Bearer ${userToken}`)
              .send(userShippingAddressData);
  
            expect(res.statusCode).toEqual(400);
            expect(res.body.error.message).toBe(`"online" is required`);
        });

        it('invalid ticket detail, should get return 400 error', async () => {
            const userShippingAddressData = {
              experienceNameId: 'Ex36STHloJpQIUvfDFTgf3DT3wXUhf',
              experienceTitle: 'Test',
              sessionId: 14,
              startTime: '2022-05-25 00:00:00',
              endTime: '2022-05-25 03:00:00',
              amount: 0,
              purchaseTimezone: 'Asia/Ho_Chi_Minh',
              tickets: [
                {
                  ticketId: 12,
                  ticketTitle: 'Test',
                  purchaseQuantity: 1,
                  online: true,
                  price: 0,
                  amount: 0
                }
              ]
          };
  
            const res = await request(app)
              .post(`/api/v1/experience/checkout/reserve-free-tickets`)
              .set('Authorization', `Bearer ${userToken}`)
              .send(userShippingAddressData);
  
            expect(res.statusCode).toEqual(400);
            expect(res.body.error.message).toBe(`"offline" is required`);
        });

        it('Redundant field, should get return 400 error', async () => {
          const userShippingAddressData = {
            experienceNameId: 'Ex36STHloJpQIUvfDFTgf3DT3wXUhf',
            experienceTitle: 'Test',
            sessionId: 14,
            startTime: '2022-05-25 00:00:00',
            endTime: '2022-05-25 03:00:00',
            amount: 0,
            totalAmount: 0,
            purchaseTimezone: 'Asia/Ho_Chi_Minh',
            tickets: [
              {
                ticketId: 1,
                ticketTitle: 'Test',
                purchaseQuantity: 1,
                online: true,
                offline: false,
                price: 0,
                amount: 0
              }
            ]
        };

          const res = await request(app)
            .post(`/api/v1/experience/checkout/reserve-free-tickets`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(userShippingAddressData);

          expect(res.statusCode).toEqual(400);
          expect(res.body.error.message).toBe(`"totalAmount" is not allowed`);
        });

        it('should return error 400 not found', async () => {

          const userShippingAddressData = {
              experienceNameId: generateNameId(5),
              experienceTitle: 'Test',
              sessionId: 161,
              startTime: "2022-04-30T07:34:00.000Z",
              endTime: "2022-04-30T07:34:00.000Z",
              amount: 0,
              purchaseTimezone: 'Asia/Ho_Chi_Minh',
              tickets: [
                  {
                      ticketId: 1,
                      purchaseQuantity: 2,
                      ticketTitle: 'Test',
                      online: true,
                      offline: false,
                      price: 0,
                      amount: 0
                  }
              ]
          };
          const res = await request(app)
              .post(`/api/v1/experience/checkout/reserve-free-tickets`)
              .set('Authorization', `Bearer ${userToken}`)
              .send(userShippingAddressData);

          expect(res.statusCode).toEqual(400);
          expect(res.body.error.message).toBe(`Experience is not found`);
        });

        it('should return error 409 is unavailable', async () => {

          const validateData = {
              experienceNameId: experienceNameId,
              experienceTitle: 'Test',
              sessionId: 161,
              startTime: "2022-04-30T07:34:00.000Z",
              endTime: "2022-04-30T07:34:00.000Z",
              amount: 0,
              purchaseTimezone: 'Asia/Ho_Chi_Minh',
              tickets: [
                  {
                      ticketId: 1,
                      ticketTitle: 'Test',
                      purchaseQuantity: 2,
                      online: true,
                      offline: false,
                      price: 0,
                      amount: 0
                  }
              ]
          };
          const res = await request(app)
              .post(`/api/v1/experience/checkout/reserve-free-tickets`)
              .set('Authorization', `Bearer ${userToken}`)
              .send(validateData);

          expect(res.statusCode).toEqual(409);
          expect(res.body.error.message).toBe(`ExperienceIsUnavailable`);
      });

      it('should return error 400 session is not found', async () => {

          await ExperienceDbModel.update({ status: ExperienceStatusEnum.PUBLISHED }, { where: { id: experienceId } });

          const validateData = {
              experienceNameId: experienceNameId,
              experienceTitle: 'Test',
              sessionId: 1234,
              startTime: "2022-04-30T07:34:00.000Z",
              endTime: "2022-04-30T07:34:00.000Z",
              amount: 0,
              purchaseTimezone: 'Asia/Ho_Chi_Minh',
              tickets: [
                  {
                      ticketId: 1,
                      ticketTitle: 'Test',
                      purchaseQuantity: 2,
                      online: true,
                      offline: false,
                      price: 0,
                      amount: 0
                  }
              ]
          };
          const res = await request(app)
              .post(`/api/v1/experience/checkout/reserve-free-tickets`)
              .set('Authorization', `Bearer ${userToken}`)
              .send(validateData);

          expect(res.statusCode).toEqual(400);
          expect(res.body.error.message).toBe(`Experience session is not found`);
      });

      it('should return error 409 ExperienceSessionWasUpdated', async () => {

          const validateData = {
              experienceNameId: experienceNameId,
              experienceTitle: 'Test',
              sessionId: session.id,
              startTime: "2022-04-30T07:34:00.000Z",
              endTime: "2022-04-30T07:34:00.000Z",
              amount: 0,
              purchaseTimezone: 'Asia/Ho_Chi_Minh',
              tickets: [
                  {
                      ticketId: 1234,
                      ticketTitle: 'Test',
                      purchaseQuantity: 2,
                      online: true,
                      offline: false,
                      price: 0,
                      amount: 0
                  }
              ]
          };
          const res = await request(app)
              .post(`/api/v1/experience/checkout/reserve-free-tickets`)
              .set('Authorization', `Bearer ${userToken}`)
              .send(validateData);

          expect(res.statusCode).toEqual(409);
          expect(res.body.error.message).toBe(`ExperienceSessionWasUpdated`);
      });

      it('should return error 400 SessionTicketsIsNotFound', async () => {

          const validateData = {
              experienceNameId: experienceNameId,
              experienceTitle: 'Test',
              sessionId: session.id,
              startTime: session.startTime,
              endTime: session.endTime,
              amount: 0,
              purchaseTimezone: 'Asia/Ho_Chi_Minh',
              tickets: [
                  {
                      ticketId: 1234,
                      ticketTitle: 'Test',
                      purchaseQuantity: 2,
                      online: true,
                      offline: false,
                      price: 0,
                      amount: 0
                  }
              ]
          };
          const res = await request(app)
              .post(`/api/v1/experience/checkout/reserve-free-tickets`)
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
              experienceNameId: experienceNameId,
              experienceTitle: 'Test',
              sessionId: session.id,
              startTime: session.startTime,
              endTime: session.endTime,
              amount: 0,
              purchaseTimezone: 'Asia/Ho_Chi_Minh',
              tickets: [
                  {
                      ticketId: ticket.id,
                      ticketTitle: 'Test',
                      purchaseQuantity: 2,
                      online: true,
                      offline: false,
                      price: 0,
                      amount: 0
                  }
              ]
          };
          const res = await request(app)
              .post(`/api/v1/experience/checkout/reserve-free-tickets`)
              .set('Authorization', `Bearer ${userToken}`)
              .send(validateData);

          expect(res.statusCode).toEqual(409);
          expect(res.body.error.message).toBe(`SessionTicketIsUnavailable`);
      });
    });
  });
});

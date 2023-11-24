import { ShopRepository } from "../../../src/dal";
import {
  ExperienceDbModel,
  ExperienceStatusEnum,
  ExperienceEventTypeEnum,
  ShopStatusEnum,
  ExperienceSessionTicketDbModel,
  ExperienceSessionDbModel
} from "../../../src/database";
import { generateNameId } from "../../../src/helpers";
import { userId, userToken } from "../constants";
import { clearTestExperienceDataByUserId, clearTestShopDataById } from "../helpers";

const request = require('supertest');
const app = require('../index');

export const testCreateDraftExperience = () =>
  describe('Create Draft experience', () => {
    const shopRepository = new ShopRepository();
    let shop: any;

    beforeAll(async () => {
      const shopData = {
        nameId: generateNameId(),
        userId,
        isFeatured: true,
        status: ShopStatusEnum.PUBLISHED,
        email: 'test@email.com'
      };
      shop = await shopRepository.create(shopData);
    });

    afterAll(async () => {
      await clearTestExperienceDataByUserId(userId)
      await clearTestShopDataById([shop.id]);
    });

    describe('Create Draft experience: Create a new experience successfull', () => {
      it('Full properties should get return created experience item', async () => {
        const experienceData = {
          title: 'new experience 1',
          description: '<p>experience description</p>',
          storySummary: '<p>story summary</p>',
          story: '<p>story</p>',
          requiredItems: '<p>requiredItems</p>',
          warningItems: '<p>warningItems</p>',
          locationCoordinate: {
            type: "Point",
            coordinates: [
              100,
              100,
            ],
          },
          location: "E town Cong Hoa",
          locationPlaceId: "some location id",
          city: "HCM",
          country: "VN",
          "locationDescription": "locatoin description",
          reflectionChangeTimezone: true,
          tickets: [
            {
              title: "Adult",
              price: 999,
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
              price: 999,
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
                startTime: "2022-04-26T07:37:50.000Z",
                endTime: "2022-05-26T07:37:50.000Z",
                tickets: [
                  {
                    title: "Adult",
                    price: 999,
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
                    price: 999,
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
          organizers: []
        };

        const res = await request(app)
          .post(`/api/v1/experiences/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(experienceData);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).not.toBeUndefined();
        expect(res.body.data.id).toBeGreaterThan(0);
        expect(res.body.data.userId).toEqual(userId);
        expect(res.body.data.nameId).not.toBeUndefined();
        expect(res.body.data.locationCoordinate).not.toBeUndefined();
        expect(res.body.data.locationPlaceId).not.toBeUndefined();
        expect(res.body.data.city).not.toBeUndefined();
        expect(res.body.data.country).not.toBeUndefined();
        expect(res.body.data.locationDescription).not.toBeUndefined();
        expect(res.body.data.reflectionChangeTimezone).not.toBeUndefined();
        expect(res.body.data.status).toEqual(ExperienceStatusEnum.DRAFT);
        expect(res.body.data.eventType).toEqual(ExperienceEventTypeEnum.ONLINE_OFFLINE);
      });

      it('Partial properties should get return created experience item', async () => {
        const experienceData = {
          title: 'new experience 1',
          description: '<p>experience description</p>',
          organizers: [],
          tickets: [
            {
              title: "Adult",
              price: 999,
              free: false,
              quantity: 5,
              availableUntilMins: 5,

              online: true,
              offline: false,
              position: 1,
              reflectChange: false
            },
            {
              title: "VIP",
              price: 999,
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
                startTime: "2022-04-26T07:37:50.000Z",
                endTime: "2022-05-26T07:37:50.000Z",
                tickets: [
                  {
                    title: "Adult",
                    price: 999,
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
                  },
                  {
                    title: "VIP",
                    price: 999,
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
        };

        const res = await request(app)
          .post(`/api/v1/experiences/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(experienceData);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).not.toBeUndefined();
        expect(res.body.data.id).toBeGreaterThan(0);
        expect(res.body.data.userId).toEqual(userId);
        expect(res.body.data.nameId).not.toBeUndefined();
        expect(res.body.data.status).toEqual(ExperienceStatusEnum.DRAFT);
        expect(res.body.data.eventType).toEqual(ExperienceEventTypeEnum.ONLINE);

      });

      it('CategoryId property should get return created experience item', async () => {
        const experienceData = {
          title: 'new experience 1',
          description: '<p>experience description</p>',
          categoryId: 1,
          organizers: [],
          tickets: [
            {
              title: "Adult",
              price: 999,
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
              price: 999,
              free: false,
              quantity: 5,
              availableUntilMins: 5,

              online: false,
              offline: true,
              position: 1,
              reflectChange: false
            }
          ],
          sessions:
            [
              {
                defaultTimezone: "Asia/Tokyo",
                startTime: "2022-04-26T07:37:50.000Z",
                endTime: "2022-05-26T07:37:50.000Z",
                tickets: [
                  {
                    title: "Adult",
                    price: 999,
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
                    price: 999,
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
                  }
                ]
              },
              {
                defaultTimezone: "Asia/Tokyo",
                startTime: "2022-04-26T07:37:50.000Z",
                endTime: "2022-05-26T07:37:50.000Z",
                tickets: [
                  {
                    title: "Adult",
                    price: 999,
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
                    price: 999,
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
                  }
                ]
              }
            ],
        };

        const res = await request(app)
          .post(`/api/v1/experiences/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(experienceData);

        expect(res.body.data.categoryId).toEqual(1);
        expect(res.body.data.eventType).toEqual(ExperienceEventTypeEnum.OFFLINE);
        expect(res.body.data.quantity).toEqual(20);
        expect(res.body.data.rarenessTotalPoint).toBe(0);
      });

      it('Transparencies should get return created experience item', async () => {
        const experienceData = {
          title: 'new experience 1',
          description: '<p>experience description</p>',
          categoryId: 1,
          organizers: [],
          tickets: [
            {
              title: "Adult",
              price: 999,
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
              price: 999,
              free: false,
              quantity: 5,
              availableUntilMins: 5,

              online: false,
              offline: true,
              position: 1,
              reflectChange: false
            }
          ],
          sessions:
            [
              {
                defaultTimezone: "Asia/Tokyo",
                startTime: "2022-04-26T07:37:50.000Z",
                endTime: "2022-05-26T07:37:50.000Z",
                tickets: [
                  {
                    title: "Adult",
                    price: 999,
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
                    price: 999,
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
        };

        const res = await request(app)
          .post(`/api/v1/experiences/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(experienceData);

        expect(res.body.data.sdgs).toEqual('[2]');
        expect(res.body.data.ethicalLevel).toEqual(41);
        expect(res.body.data.transparencyLevel).toEqual(8);
        expect(res.body.data.rarenessLevel).toEqual(1);
        expect(res.body.data.recycledMaterialPercent).toEqual(49);
        expect(res.body.data.materialNaturePercent).toEqual(50);
        expect(res.body.data.rarenessTotalPoint).toBe(5);
      });

      it('Calculate availableUntilDate should get return created experience item', async () => {
        const experienceData = {
          title: 'new experience 1',
          description: '<p>experience description</p>',
          organizers: [],
          tickets: [
            {
              title: "Adult",
              price: 999,
              free: false,
              quantity: 5,
              availableUntilMins: 5,

              online: true,
              offline: false,
              position: 1,
              reflectChange: false
            },
            {
              title: "VIP",
              price: 999,
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
                startTime: "2022-04-26T07:37:50.000Z",
                endTime: "2022-05-26T07:37:50.000Z",
                tickets: [
                  {
                    title: "Adult",
                    price: 999,
                    quantity: 5,
                    availableUntilMins: 60,
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
                  },
                  {
                    title: "VIP",
                    price: 999,
                    quantity: 5,
                    availableUntilMins: 60,
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
        };

        const res = await request(app)
          .post(`/api/v1/experiences/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(experienceData);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).not.toBeUndefined();
        expect(res.body.data.id).toBeGreaterThan(0);
        expect(res.body.data.id).toBeGreaterThan(0);

        var experience = await ExperienceDbModel.findByPk(res.body.data.id, {
          include: [{
            model: ExperienceSessionDbModel, as: 'sessions',
            include: [{ model: ExperienceSessionTicketDbModel, as: 'tickets' }]
          }]
        }) as any;

        expect(experience.sessions[0].tickets[0].availableUntilDate)
          .toEqual(new Date('2022-04-26T06:37:50.000Z'))

      });

    });

    describe('Create Draft experience: Create a new experience fail', () => {
      it('should get return error 400', async () => {
        const experienceData = {
          nameId: 'nameId',
          title: 'new experience 1',
          description: '<p>experience description</p>',
          storySummary: '<p>story summary</p>',
          story: '<p>story</p>',
          requiredItems: '<p>requiredItems</p>',
          warningItems: '<p>warningItems</p>',
          cancelPolicy: '<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<',
          organizers: []
        };

        const res = await request(app)
          .post(`/api/v1/experiences/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(experienceData);

        expect(res.statusCode).toEqual(400);
      });
    });
  });

import { ShopDbModel, ShopStatusEnum } from "../../../src/database";
import { generateNameId } from "../../../src/helpers";
import { clearTestExperienceDataByUserId, clearTestShopDataById } from "../helpers";

const request = require('supertest');
const app = require('../index');

export const testGetTopExperiences = () =>
    describe('GET TOP EXPERIENCES', () => {
        let shop: any;

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
                        name: "organizer top experience",
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
                        city: null,
                        country: null,
                        free: false,
                        id: 0,
                        location: null,
                        locationCoordinate: null,
                        locationPlaceId: null,
                        offline: false,
                        online: true,
                        price: 11,
                        quantity: 1111,
                        reflectChange: false,
                        title: "ticket 1"
                    },
                    {
                        availableUntilMins: 2880,
                        city: null,
                        country: null,
                        free: false,
                        id: 0,
                        location: null,
                        locationCoordinate: null,
                        locationPlaceId: null,
                        offline: false,
                        online: true,
                        price: 111,
                        quantity: 222,
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
                                price: 11,
                                quantity: 1111,
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
                                price: 111,
                                quantity: 222,
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
                                price: 11,
                                quantity: 1111,
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
                                price: 111,
                                quantity: 222,
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

            await request(app)
                .post(`/api/v1/experiences/add`)
                .send(experienceData);
        })

        afterAll(async () => {
            await clearTestExperienceDataByUserId(9999)
            await clearTestShopDataById([shop.id]);
        })

        it('should return status code 200 OK Request', async () => {
          const res = await request(app)
            .get(`/api/v1/experiences/top-experiences`)
          expect(res.statusCode).toEqual(200);
          expect(res.body.data).not.toBeUndefined();
        });

    })


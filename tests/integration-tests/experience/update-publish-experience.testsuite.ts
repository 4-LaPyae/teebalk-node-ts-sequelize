import { ExperienceRepository, ShopRepository } from "../../../src/dal";
import { ExperienceContentDbModel, ExperienceDbModel, ExperienceSessionDbModel, ExperienceImageDbModel, ExperienceStatusEnum, ShopStatusEnum } from "../../../src/database/models";
import { generateNameId } from "../../../src/helpers";
import { clearTestExperienceDataByUserId, clearTestShopDataById } from "../helpers";

const request = require('supertest');
const app = require('../index');

export const testUpdateStatusPublishExperience = () =>
  describe('Test publish experience api', () => {
    const shopRepository = new ShopRepository();
    const experienceRepository = new ExperienceRepository();

    let shop: any;
    let userToken: string;
    let experienceId: number;

    beforeAll(async () => {
      const shopData = {
        nameId: generateNameId(),
        userId: 9999,
        platformPercents: 5,
        isFeatured: true,
        status: ShopStatusEnum.PUBLISHED,
        email: 'test@email.com'
      };
      shop = await shopRepository.create(shopData);
      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';

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
                  quantity: 1111,
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
                  price: 111,
                  quantity: 222,
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
                          enable: true,
                          eventLink: null,
                          eventPassword: null,
                          id: 0,
                          offline: false,
                          online: true,
                          price: 11,
                          quantity: 1111,
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
                          price: 111,
                          quantity: 222,
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
                          price: 11,
                          quantity: 1111,
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
                          price: 111,
                          quantity: 222,
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
                      displayPosition: 1,
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

    });

    afterAll(async () => {
      await clearTestExperienceDataByUserId(9999)
      await clearTestShopDataById([shop.id]);
    });

    describe('Update Successfull: Update status experience successfull', () => {
      it('should get return 200 updated status Publish', async () => {
        const res = await request(app)
          .patch(`/api/v1/experiences/${experienceId}/publish`)
          .set('Authorization', `Bearer ${userToken}`)

        expect(res.statusCode).toEqual(200);

        const experienceData = await experienceRepository.findOne({
          where: { id: experienceId }
        });
        expect(experienceData.status).toBe(ExperienceStatusEnum.PUBLISHED);
      });
    });

    describe('Update Error: Update status experience error ', () => {
      it('should get return error 400 images is empty', async () => {
        await ExperienceImageDbModel.destroy({
          where: { experienceId: experienceId }
        });
        const res = await request(app)
          .patch(`/api/v1/experiences/${experienceId}/publish`)
          .set('Authorization', `Bearer ${userToken}`)
        expect(res.statusCode).toEqual(400);
      });

      it('should get return error 400 contents is empty', async () => {
        const imageData = {
          experienceId: experienceId,
          imagePath: 'http://abc'
        }
        await ExperienceImageDbModel.create(imageData);
        await ExperienceContentDbModel.destroy({
          where: { experienceId: experienceId }
        });
        const res = await request(app)
          .patch(`/api/v1/experiences/${experienceId}/publish`)
          .set('Authorization', `Bearer ${userToken}`)
        expect(res.statusCode).toEqual(400);
      });

      it('should get return error 400 session is empty', async () => {
        const imageData = {
          experienceId: experienceId,
          imagePath: 'http://abc'
        }
        const contentData = {
          experienceId: experienceId,
          title: 'abc',
          description: 'test'
        }
        await ExperienceImageDbModel.create(imageData);
        await ExperienceContentDbModel.create(contentData);
        await ExperienceSessionDbModel.destroy({
          where: { experienceId: experienceId }
        });
        const res = await request(app)
          .patch(`/api/v1/experiences/${experienceId}/publish`)
          .set('Authorization', `Bearer ${userToken}`)
        expect(res.statusCode).toEqual(400);
      });

      it('should get return 404 when publish a deleted experience', async () => {
        await ExperienceDbModel.destroy({ where: { id: experienceId } });

        const res = await request(app)
          .patch(`/api/v1/experiences/${experienceId}/publish`)
          .set('Authorization', `Bearer ${userToken}`)
        expect(res.statusCode).toEqual(409);
        expect(res.body.error.message).toBe(`ExperienceIsUnavailableForPublish`);

        await ExperienceDbModel.update({ deletedAt: null }, {
          where: { id: experienceId}
        });
      });
    });
  });

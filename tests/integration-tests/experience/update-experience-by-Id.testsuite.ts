import { Op } from 'sequelize';
import {
    ShopRepository,
    ExperienceContentRepository,
    ExperienceImageRepository,
    ExperienceOrganizerRepository,
    ExperienceRepository
  } from '../../../src/dal';
  import {
    ExperienceContentDbModel,
    ExperienceImageDbModel,
    ExperienceOrganizerDbModel,
    ExperienceTicketDbModel,
    ExperienceSessionDbModel,
    ExperienceSessionTicketDbModel,
    ExperienceDbModel,
    ShopDbModel,
    ShopStatusEnum,
    ExperienceStatusEnum,
    ExperienceTransparencyDbModel
  } from '../../../src/database/models';
  import { generateNameId } from '../../../src/helpers';
  const request = require('supertest');
  const app = require('../index');
  
  export const testUpdateExperienceById = () =>
    describe('PATCH Update Experience by Id', () => {
      const shopRepository = new ShopRepository();
      const experienceContentRepository = new ExperienceContentRepository();
      const experienceImageRepository = new ExperienceImageRepository();
      const experienceOrganizerRepository = new ExperienceOrganizerRepository();
      const experienceRepository = new ExperienceRepository();
  
      let shop: any;
      let userToken: string;
      let experience: any;
  
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
          title: 'new experience 1',
          description: '<p>experience description</p>',
          storySummary: '<p>story summary</p>',
          story: '<p>story</p>',
          requiredItems: '<p>requiredItems</p>',
          warningItems: '<p>warningItems</p>',
          cancelPolicy: '<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<',
          images: [
            {
              imagePath: 'http://abc',
              imageDescription: '「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<中国か'
            }
          ]
        };
        const res = await request(app)
          .post(`/api/v1/experiences/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(experienceData);
        experience = res.body.data;
      });
  
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
  
        await ExperienceContentDbModel.destroy({
          where: { experienceId: experienceIds },
          force: true
        });
  
        await ExperienceImageDbModel.destroy({
          where: { experienceId: experienceIds },
          force: true
        });

        await ExperienceTransparencyDbModel.destroy({
          where: { experienceId: experienceIds },
          force: true
        });
  
        await ExperienceOrganizerDbModel.destroy({
          where: { experienceId: experienceIds },
          force: true
        });

        const createdSessionList = await ExperienceSessionDbModel.findAll({
          where: {
            experienceId: experienceIds
          },
          attributes: ['id']
        });
  
        const sessionIds: number[] = createdSessionList.map(item => {
          return (item as any).id;
        });

        await ExperienceSessionTicketDbModel.destroy({
          where: { sessionId: sessionIds },
          force: true
        });
  
        await ExperienceTicketDbModel.destroy({
          where: { experienceId: experienceIds },
          force: true
        });
  
        await ExperienceSessionDbModel.destroy({
          where: { experienceId: experienceIds },
          force: true
        });
  
        await ExperienceDbModel.destroy({
          where: { [Op.or]: [{ userId: 9999 }, { userId: 1111 }], },
          force: true
        });
  
        await ShopDbModel.destroy({
          where: { id: shop.id },
          force: true
        });
      });
  
      it('should get return updated content', async () => {
        const updateData = {
          title: "updated"
        };
  
        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        const item = await experienceContentRepository.findOne({
          where: { experienceId: experience.id }
        });
        expect(res.statusCode).toEqual(200);
        expect(item.title).toEqual(updateData.title);
      });
  
      it('should get return updated images', async () => {
        const item = await experienceImageRepository.findOne({
          where: { experienceId: experience.id }
        });
        const updateData = {
          images: [
            {
              id: item.id,
              imagePath: 'http://abc',
            }
          ]
        };
        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
  
        const updatedExperience = await experienceImageRepository.findOne({
          where: { id: item.id }
        });
        expect(res.statusCode).toEqual(200);
        expect(updatedExperience.imagePath).toBe(updateData.images[0].imagePath);
      });

      it('should get return updated images includes new images', async () => {
        const item = await experienceImageRepository.findOne({
          where: { experienceId: experience.id }
        });
        const updateData = {
          images: [
            {
              id: item.id,
              imagePath: 'http://abc',
            },
            {
              id: 0,
              imagePath: 'http://abc',
              imageDescription: 'add new',
              position: 2
            }
          ]
        };
        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
  
        const updatedExperience = await experienceImageRepository.findAll({
          where: { experienceId: experience.id }
        });
        expect(res.statusCode).toEqual(200);
        expect(updatedExperience.length).toBe(2);
      });

      it('should get return updated more images ', async () => {
        const item = await experienceImageRepository.findAll({
          where: { experienceId: experience.id }
        });
        const updateData = {
          images: [
            {
              id: item[0].id,
              imagePath: 'test update image 1',
              position: 1
            },
            {
              id: item[1].id,
              imagePath: 'test update image 2',
              imageDescription: 'test update',
              position: 2
            }
          ]
        };
        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
  
        const updatedExperience = await experienceImageRepository.findAll({
          where: { experienceId: experience.id }
        });
        expect(res.statusCode).toEqual(200);
        expect(updatedExperience[0].imagePath).toBe(updateData.images[0].imagePath);
        expect(updatedExperience[1].imagePath).toBe(updateData.images[1].imagePath);
        expect(updatedExperience[1].imageDescription).toBe(updateData.images[1].imageDescription);
      });

      it('should get return error when update images removed', async () => {
        const item = await experienceImageRepository.findOne({
          where: { experienceId: experience.id }
        });
        await experienceImageRepository.delete({
            where: { experienceId: experience.id }
          });
        const updateData = {
          images: [
            {
              id: item.id,
              imagePath: 'http://abc',
            }
          ]
        };
        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
  
        expect(res.statusCode).toEqual(200);
      });
  
      it('should get return updated organizers', async () => {
        const organizerData =
        {
          experienceId: experience.id,
          name: 'test',
          position: true,
          comment: 'organizers update',
          photo: 'http://abc',
          displayPosition: null
        };
        await ExperienceOrganizerDbModel.create(organizerData);
  
        const item = await experienceOrganizerRepository.findOne({
          where: { experienceId: experience.id }
        });
        const updateData = {
          organizers: [
            {
              id: item.id,
              name: 'updated',
              comment: 'organizers updated'
            }
          ]
        };
        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
  
        const updatedExperience = await experienceOrganizerRepository.findOne({
          where: { id: item.id }
        });
        expect(res.statusCode).toEqual(200);
        expect(updatedExperience.name).toBe(updateData.organizers[0].name);
        expect(updatedExperience.comment).toBe(updateData.organizers[0].comment);
      });

      it('should get return updated organizers includes new organizers', async () => {
        const item = await experienceOrganizerRepository.findOne({
          where: { experienceId: experience.id }
        });
        const updateData = {
           organizers: [
            {
                id: item.id,
                name: 'updated',
                comment: 'organizers updated',
                displayPosition: 1
            },
            {
                id: 0,
                name: 'updated',
                comment: 'organizers updated',
                position: 'str',
                displayPosition: 2
            }
          ]
        };
        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
  
        const updatedExperience = await experienceOrganizerRepository.findAll({
          where: { experienceId: experience.id }
        });
        expect(res.statusCode).toEqual(200);
        expect(updatedExperience.length).toBe(2);
      });

      it('should get return updated more organizers ', async () => {
        const item = await experienceOrganizerRepository.findAll({
          where: { experienceId: experience.id }
        });
        const updateData = {
          organizers: [
            {
                id: item[0].id,
                name: 'updated',
                comment: 'organizers updated',
                displayPosition: 1
            },
            {
                id: item[1].id,
                name: 'updated',
                comment: 'organizers updated',
                position: 'str',
                displayPosition: 2
            }
          ]
        };
        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
  
        const updatedExperience = await experienceOrganizerRepository.findAll({
          where: { experienceId: experience.id }
        });
        expect(res.statusCode).toEqual(200);
        expect(updatedExperience[0].name).toBe(updateData.organizers[0].name);
        expect(updatedExperience[1].name).toBe(updateData.organizers[1].name);
        expect(updatedExperience[1].comment).toBe(updateData.organizers[1].comment);
      });
  
      it('should return error 409 Not Exist', async () => {
        const updateData = {
          title: "<p>updated</p>"
        };
        const experienceId = 123;
        const res = await request(app)
          .patch(`/api/v1/experiences/${experienceId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(409);
      });
     
      it('should get return updated rarenessTotalPoint experience', async () => {
        const updateData = {
          transparency: {
            highlightPoints: [1, 2, 11, 12, 13],
            rarenessLevel: 4
          }
        };

        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        const item = await experienceRepository.findOne({
          where: { id: experience.id }
        });
        expect(res.statusCode).toEqual(200);
        expect(item.rarenessTotalPoint).toEqual(3.7);
        expect(item.rarenessLevel).toBe(updateData.transparency.rarenessLevel);
      });

      it('should get return updated experience with rarenessLevel null', async () => {
        const updateData = {
          transparency: {
            rarenessLevel: null
          }
        };

        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);

        const item = await experienceRepository.findOne({
          where: { id: experience.id }
        });
        expect(res.statusCode).toEqual(200);
        expect(item.rarenessTotalPoint).toEqual(0);
        expect(item.rarenessLevel).toBe(null);
      });

      it('should return error 403 Not update experience of other seller', async () => {
        const experienceData = {
          userId: 1111,
          shopId: 1,
          nameId:  generateNameId(5),
          status: ExperienceStatusEnum.DRAFT
        };

        const experienceOtherSeller = await experienceRepository.create(experienceData) as any;

        const updateData = {
            title: 'new experience 1',
            description: '<p>experience description</p>',
            storySummary: '<p>story summary</p>',
            story: '<p>story</p>',
            requiredItems: '<p>requiredItems</p>',
            warningItems: '<p>warningItems</p>',
            cancelPolicy: '<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<',
            categoryId: 1,
            images: [
              {
                imagePath: 'http://abc',
                imageDescription: 'test'
              }
            ],
            organizers: [
                {
                  photo: 'http://abc',
                  name: 'test',
                  position: 'abc',
                  comment: 'testing'                 
                }
            ]
        };
        
        const res = await request(app)
          .patch(`/api/v1/experiences/${experienceOtherSeller.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);

        expect(res.statusCode).toEqual(403);
      });

      it('should return error 403 Not update a published experience of other seller', async () => {
        const experienceData = {
          userId: 1111,
          shopId: 1,
          nameId:  generateNameId(5),
          status: ExperienceStatusEnum.PUBLISHED
        };

        const experienceOtherSeller = await experienceRepository.create(experienceData) as any;

        const updateData = {
            title: 'new experience 1',
            description: '<p>experience description</p>',
            storySummary: '<p>story summary</p>',
            story: '<p>story</p>',
            requiredItems: '<p>requiredItems</p>',
            warningItems: '<p>warningItems</p>',
            cancelPolicy: '<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<',
            categoryId: 1,
            images: [
              {
                imagePath: 'http://abc',
                imageDescription: 'test'
              }
            ],
            organizers: [
                {
                  photo: 'http://abc',
                  name: 'test',
                  position: 'abc',
                  comment: 'testing'                 
                }
            ],
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
        };
        
        const res = await request(app)
          .patch(`/api/v1/experiences/${experienceOtherSeller.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);

        expect(res.statusCode).toEqual(403);
      });
  
      it('should get return error 400 required description', async () => {
        await ExperienceDbModel.update(
          {
            status: ExperienceStatusEnum.PUBLISHED
          },
          { where: { id: experience.id } }
        );
        const updateData = {
          title: "<p>updated</p>"
        };
        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe(`"description" is required`);
      });

      it('should get return error 400 required title', async () => {
        const updateData = {
          description: "<p>updated</p>"
        };
        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe(`"title" is required`);
      });

      it('should get return error 400 required storySummary', async () => {
        const updateData = {
          title: "<p>updated</p>",
          description: "<p>updated</p>"
        };
        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe(`"storySummary" is required`);
      });

      it('should get return error 400 required imagePath', async () => {
        const updateData = {
            title: 'new experience 1',
            description: '<p>experience description</p>',
            storySummary: '<p>story summary</p>',
            story: '<p>story</p>',
            requiredItems: '<p>requiredItems</p>',
            warningItems: '<p>warningItems</p>',
            cancelPolicy: '<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<',
            categoryId: 1,
            images: [
              {
                imageDescription: 'http://abc'
              }
            ]
        };
        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe(`"imagePath" is not allowed to be empty`);
      });

      it('should get return error 400 required organizers', async () => {
        const updateData = {
            title: 'new experience 1',
            description: '<p>experience description</p>',
            storySummary: '<p>story summary</p>',
            story: '<p>story</p>',
            requiredItems: '<p>requiredItems</p>',
            warningItems: '<p>warningItems</p>',
            cancelPolicy: '<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<',
            categoryId: 1,
            images: [
              {
                imagePath: 'http://abc',
                imageDescription: 'test'
                
              }
            ]
        };
        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe(`"organizers" is required`);
      });

      it('should get return error 400 required position organizers', async () => {
        const updateData = {
            title: 'new experience 1',
            description: '<p>experience description</p>',
            storySummary: '<p>story summary</p>',
            story: '<p>story</p>',
            requiredItems: '<p>requiredItems</p>',
            warningItems: '<p>warningItems</p>',
            cancelPolicy: '<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<',
            categoryId: 1,
            images: [
              {
                imagePath: 'http://abc',
                imageDescription: 'test'
                
              }
            ],
            organizers: [
                {
                  photo: 'http://abc',
                  name: 'test'
                  
                }
            ]
        };
        const res = await request(app)
          .patch(`/api/v1/experiences/${experience.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(updateData);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toBe(`"position" is required`);
      });
  });
  
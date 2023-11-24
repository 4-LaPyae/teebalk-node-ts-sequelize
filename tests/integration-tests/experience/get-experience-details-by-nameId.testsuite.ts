import { Op } from 'sequelize';
import {
    ShopRepository
  } from '../../../src/dal';
  import {
    ExperienceContentDbModel,
    ExperienceImageDbModel,
    ExperienceOrganizerDbModel,
    ExperienceDbModel,
    ShopDbModel,
    ShopStatusEnum,
    ExperienceStatusEnum,
    ShopContentDbModel,
    ShopImageDbModel
  } from '../../../src/database/models';
  
  import { generateNameId } from '../../../src/helpers';
  const request = require('supertest');
  const app = require('../index');
  
  export const getExperienceByNameId = () =>
    describe('GET Experience by NameId', () => {
      const shopRepository = new ShopRepository();
  
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
            organizers: []
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
  
        await ExperienceOrganizerDbModel.destroy({
          where: { experienceId: experienceIds },
          force: true
        });
  
        await ExperienceDbModel.destroy({
          where: { [Op.or]: [{ userId: 9999 }, { userId: 1111 }], },
          force: true
        });

        await ShopContentDbModel.destroy({
          where: { shopId: shop.id },
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
      });
  
      it('should return status code 200 OK Request', async () => {
        const res = await request(app)
          .get(`/api/v1/experiences/${experience.nameId}/edit`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
      });
  
      it('should return status code 200 with experience images', async () => {
        const imageData =
        {
          experienceId: experience.id,
          imagePath: 'http://abc',
          imageDescription: 'testing'
        };
        await ExperienceImageDbModel.create(imageData);
        const res = await request(app)
          .get(`/api/v1/experiences/${experience.nameId}/edit`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.images.length).toEqual(1);
        expect(res.body.data.images[0].imagePath).toEqual(imageData.imagePath);
        expect(res.body.data.images[0].imageDescription).toEqual(imageData.imageDescription);
      });
  
      it('should return status code 200 with experience organizers', async () => {
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
        const res = await request(app)
          .get(`/api/v1/experiences/${experience.nameId}/edit`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.organizers.length).toEqual(1);
        expect(res.body.data.organizers[0].name).toEqual(organizerData.name);
        expect(res.body.data.organizers[0].comment).toEqual(organizerData.comment);
        expect(res.body.data.organizers[0].photo).toEqual(organizerData.photo);
      });

      it('should return status code 200 with information shop', async () => {
        const shopContentData =
        {
          shopId: shop.id,
          title: 'test shop content',
          description: 'test',
          subTitle: 'Hello!!!',
          policy: "<p>Hello!!!</p>"
        };
        const shopImageData = {
          id: 0,
          shopId: shop.id,
          imageDescription: "image description",
          imagePath: "some image path",
          isOrigin: 1
        };
        await ExperienceDbModel.update({ shopId: shop.id }, { where: { nameId: experience.nameId } });
        await ShopContentDbModel.create(shopContentData);
        await ShopImageDbModel.create(shopImageData);
        const res = await request(app)
          .get(`/api/v1/experiences/${experience.nameId}/edit`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.shop.content.description).toEqual(shopContentData.description);
        expect(res.body.data.shop.content.title).toEqual(shopContentData.title);
        expect(res.body.data.shop.images.length).toBeGreaterThan(0);
        expect(res.body.data.shop.images[0].imagePath).toEqual(shopImageData.imagePath);
        expect(res.body.data.shop.images[0].imageDescription).toEqual(shopImageData.imageDescription);
      });
  
      it('should return status code 400 Bad Request', async () => {
        const invalidNameId = '123';
        const res = await request(app)
          .get(`/api/v1/experiences/${invalidNameId}/edit`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(400);
      });
  
      it('should return status code 404 Not Found', async () => {
        const experienceNameId = generateNameId(5);
        const res = await request(app)
          .get(`/api/v1/experiences/${experienceNameId}/edit`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(404);
      });

      it('should return error 404 Not load experience of other seller', async () => {
        const experienceData = {
          userId: 1111,
          shopId: 1,
          nameId:  generateNameId(5),
          status: ExperienceStatusEnum.PUBLISHED
        };

        const experienceOtherSeller = await ExperienceDbModel.create(experienceData).value as any; 
        const res = await request(app)
          .get(`/api/v1/experiences/${experienceOtherSeller.nameId}/edit`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(404);
      });
    });
  
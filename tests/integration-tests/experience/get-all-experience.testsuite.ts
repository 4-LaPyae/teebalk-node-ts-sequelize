import {
    ShopRepository
  } from '../../../src/dal';
  import {
    ShopStatusEnum
  } from '../../../src/database/models';
import { generateNameId } from '../../../src/helpers';
import { clearTestExperienceDataByUserId, clearTestShopDataById } from '../helpers';
  
  const request = require('supertest');
  const app = require('../index');
  
  export const getListExperiences = () =>
    describe('GET /all', () => {
      const shopRepository = new ShopRepository();

      let shop: any;
      let userToken: string;
  
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
       await request(app)
          .post(`/api/v1/experience/add`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(experienceData);
        });
  
      afterAll(async () => {
        await clearTestExperienceDataByUserId(9999)
        await clearTestShopDataById(shop.id);
      });
  
      it('should return status code 200 OK Request', async () => {
        const res = await request(app)
          .get(`/api/v1/experiences/all`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).not.toBeUndefined();
      });

      it('should get return error 400 limit bigger 100', async () => {
        const res = await request(app)
          .get(`/api/v1/experiences/all?limit= 120`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(400);
      });

      it('should get return error 400 pageNumber is 0', async () => {
        const res = await request(app)
          .get(`/api/v1/experiences/all?pageNumber=0`)
          .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(400);
      });
    });
  
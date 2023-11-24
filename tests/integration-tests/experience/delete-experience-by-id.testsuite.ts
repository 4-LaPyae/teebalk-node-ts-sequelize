import { ExperienceRepository, ShopRepository } from "../../../src/dal";
import { ExperienceDbModel, ExperienceStatusEnum, ShopDbModel, ShopStatusEnum } from "../../../src/database";
import { generateNameId } from "../../../src/helpers";

const request = require('supertest');
const app = require('../index');

export const testDeleteExperience = () =>
  describe('Delete Experience', () => {
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
        nameId: generateNameId(),
        shopId: shop.id,
        userId: 9999,
        status: ExperienceStatusEnum.DRAFT,
        quantity: 10,
        storySummary: '<p>story summary</p>',
        story: '<p>story</p>',
        requiredItems: '<p>requiredItems</p>',
        warningItems: '<p>warningItems</p>',
        cancelPolicy: '<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<',
        organizers: []
      };

      const experience = await experienceRepository.create(experienceData);
      experienceId = experience ? experience.id : 0;

    });
    afterAll(async () => {
      await ExperienceDbModel.destroy({
        where: { userId: 9999 },
        force: true
      });

      await ShopDbModel.destroy({
        where: { id: shop.id },
        force: true
      });
    });

    describe('Delete Successfull: Delete experience successfull', () => {
      it('should get return updated status is deleted', async () => {
        const res = await request(app)
          .delete(`/api/v1/experiences/${experienceId}`)
          .set('Authorization', `Bearer ${userToken}`)
        expect(res.statusCode).toEqual(200);
      });
    });

    describe('Delete Error: Delete experience error ', () => {
      it('should get return error 409 experience is not exist', async () => {
        const res = await request(app)
          .delete(`/api/v1/experiences/12345`)
          .set('Authorization', `Bearer ${userToken}`)
        expect(res.statusCode).toEqual(409);
      });
    });
});

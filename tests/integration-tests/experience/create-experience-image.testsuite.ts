import _ from "lodash";
import {
    ExperienceImageDbModel,
    IExperienceImageModel,
    ShopDbModel,
    ShopStatusEnum
} from "../../../src/database";
import { generateNameId } from "../../../src/helpers";
import { userId, userToken } from "../constants";
import { clearTestExperienceDataByUserId, clearTestShopDataById } from "../helpers";

const request = require('supertest');
const app = require('../index');

let image: Partial<IExperienceImageModel>;
let experienceData: any;

export const createExperienceImageTest = () =>
    describe('CREATE EXPERIENCE', () => {
        let shop: any;

        beforeAll(async () => {

            const shopData = {
                nameId: generateNameId(),
                userId,
                isFeatured: true,
                status: ShopStatusEnum.PUBLISHED,
                email: 'test@email.com'
            };
            shop = await ShopDbModel.create(shopData);

            image = {
                id: 0,
                experienceId: 0,
                imageDescription: "image description",
                imagePath: "some image path",
                position: 0,

            }
            experienceData = {
                title: 'new experience 1',
                description: '<p>experience description</p>',
                storySummary: '<p>story summary</p>',
                story: '<p>story</p>',
                requiredItems: '<p>requiredItems</p>',
                warningItems: '<p>warningItems</p>',
                cancelPolicy: '<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<',
                organizers: []
            };
        })
        afterAll(async () => {
            await clearTestExperienceDataByUserId(userId)
            await clearTestShopDataById([shop.id]);
        })

        it('when valid data should return 200', async () => {

            const res = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    ...experienceData, images: [
                        { ...image, position: 0 },
                        { ...image, position: 1 }]
                }) as any;

            expect(res.statusCode).toEqual(200);

            const images = await ExperienceImageDbModel.findAll({
                where: { experienceId: res.body.data.id }
            }) as any[];

            expect(images.length).toEqual(2);

        });

        it('when missing imagePath return 400', async () => {

            let res = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send([{ ...experienceData, imagePath: '' }]) as any;

            expect(res.statusCode).toEqual(400);

        });

        it("when duplicate position should return 400", async () => {
            let res = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ ...experienceData, tickets: [image, image] }) as any;

            expect(res.statusCode).toEqual(400);
        })



    })


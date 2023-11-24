import _ from "lodash";
import { ExperienceTicketDbModel, IExperienceTicketModel, ShopDbModel, ShopStatusEnum } from "../../../src/database";
import { generateNameId } from "../../../src/helpers";
import { userId, userToken } from "../constants";
import { clearTestExperienceDataByUserId, clearTestShopDataById } from "../helpers";

const request = require('supertest');
const app = require('../index');
let ticket: Partial<IExperienceTicketModel>;
let experienceData: any;

export const createExperienceTicketTest = () =>
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

            ticket = {
                id: 0,
                availableUntilMins: 100,
                free: false,
                experienceId: 0,
                offline: true,
                online: false,
                price: 100,
                position: 1,
                quantity: 1000,
                reflectChange: true,
                title: "title"
            }
            experienceData = {
                title: 'new experience 1',
                description: '<p>experience description</p>',
                storySummary: '<p>story summary</p>',
                story: '<p>story</p>',
                requiredItems: '<p>requiredItems</p>',
                warningItems: '<p>warningItems</p>',
                cancelPolicy: '<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<',
                organizers: [],
                sessions: []
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
                    ...experienceData, tickets: [
                        { ...ticket, title: "title1" },
                        { ...ticket, title: "title2" }]
                }) as any;

            expect(res.statusCode).toEqual(200);

            const tickets = await ExperienceTicketDbModel.findAll({
                where: { experienceId: res.body.data.id }
            }) as any[];

            expect(tickets.length).toEqual(2);

        });

        it('when missing title or price should return 400', async () => {

            let res = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ ...experienceData, tickets: [_.omit(ticket, "title")] }) as any;

            expect(res.statusCode).toEqual(400);

            res = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ ...experienceData, tickets: [_.omit(ticket, "price")] }) as any;

            expect(res.statusCode).toEqual(400);

        });

        it("when duplicate title should return 400", async () => {
            let res = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ ...experienceData, tickets: [ticket, ticket] }) as any;

            expect(res.statusCode).toEqual(400);
        })

        it("when offline and have no location should return 400", async () => {
            let res = await request(app)
                .post(`/api/v1/experiences/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ ...experienceData, tickets: [{ ...ticket, offline: true, location: null }] }) as any;

            expect(res.statusCode).toEqual(400);
        })


    })


import {
    ProductAvailableNotificationDbModel,
    ProductCategoryDbModel,
    ProductColorDbModel,
    ProductContentDbModel,
    ProductCustomParameterDbModel,
    ProductDbModel,
    ProductImageDbModel,
    ProductLocationDbModel,
    ProductMaterialDbModel,
    ProductPatternDbModel,
    ProductProducerDbModel,
    ProductRegionalShippingFeesDbModel,
    ProductStoryDbModel,
    ProductTransparencyDbModel,
    ShopDbModel
} from "../../../src/database";
import { createTestShop } from '../helpers';

const request = require('supertest');

const app = require('../index');

export const testAuditProductAvailable = () => {

    describe('AuditProductService', () => {
        let shop: any;
        let userToken: string;
        let productId: number;
        let productData: any;

        beforeAll(async () => {
            shop = await createTestShop();
            userToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';

            productData = {
                story: {
                    content: '<p>The product story content</p>',
                    plainTextContent: '<p>「日本と中国と竹」</p>',
                    isOrigin: true,
                    summaryContent: 'this summary content data'
                },
                transparency: {
                    materialNaturePercent: 5,
                    recycledMaterialDescription: '<p>material descriptionescription</p>',
                    sdgsReport: 'sdsdsds',
                    contributionDetails: 'fsdds',
                    effect: 'fddffdff',
                    culturalProperty: 'dfsdfs',
                    rarenessDescription: 'dsfsdf',
                    materials: [
                        {
                            material: 'cotton',
                            percent: 85,
                            displayPosition: 0,
                            isOrigin: true
                        },
                        {
                            material: 'silk',
                            percent: 10,
                            displayPosition: 1,
                            isOrigin: true
                        },
                        {
                            material: 'wood',
                            percent: 5,
                            displayPosition: 2,
                            isOrigin: true
                        }
                    ],
                    recycledMaterialPercent: 6,
                    isOrigin: true
                },
                categoryId: 1,
                price: 3423,
                productWeight: 5,
                content: {
                    title: 'Title',
                    subTitle: 'dfsd',
                    annotation: 'dasda',
                    description:
                        '<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かに<p>「日本と中国と竹」</p><p>日本と竹の出会いは縄文時代にさかのぼり、日本人の生活や食を豊かにしてきてくれました。しなやかで強く、多岐にわたる用途に活用できる竹は、まさに自然からの恵みであり、美しい竹林風景、住居材、毛筆・茶道具・扇子・竹刀などの工芸品や趣向品に至るまで日本文化の伝承や私たちの暮らしに欠かせません。</p><br><p>日本の竹種の多くは、中国から伝わってきたといわれており、その中国の竹林面積は日本の42倍といわれるくらい広大で、日本以上に竹は身近に存在していました。<'
                },
                language: 'en',
                isFreeShipment: false,
                images: [
                    {
                        imagePath: 'https://localhost:9000',
                        isOrigin: true
                    }
                ],
                colors: [
                    {
                        color: 'red',
                        displayPosition: 0,
                        isOrigin: true
                    },
                    {
                        color: 'green',
                        displayPosition: 1,
                        isOrigin: true
                    },
                    {
                        color: 'blue',
                        displayPosition: 2,
                        isOrigin: true
                    }
                ],
                patterns: [
                    {
                        pattern: 'dot',
                        displayPosition: 0,
                        isOrigin: true
                    }
                ],
                customParameters: [
                    {
                        customParameter: 'logo',
                        displayPosition: 0,
                        isOrigin: true
                    }
                ],
                shippingFee: 0,
                allowInternationalOrders: true,
                overseasShippingFee: 1400,
                regionalShippingFees: [
                    {
                        prefectureCode: 'JP-47',
                        shippingFee: 1000
                    },
                    {
                        prefectureCode: 'JP-01',
                        shippingFee: 1000
                    }
                ]
            };
            const res = await request(app)
                .post(`/api/v1/products/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(productData);

            productId = res.body.data.id;

            await publishProduct(productId, userToken);

        });

        afterAll(async () => {
            const createdProductsList = await ProductDbModel.findAll({
                where: {
                    userId: 9999
                },
                attributes: ['id']
            });
            const productIds: number[] = createdProductsList.map(item => {
                return (item as any).id;
            });

            await ProductCategoryDbModel.destroy({
                where: { productId: productIds },
                force: true
            });

            await ProductDbModel.destroy({
                where: { userId: 9999 },
                force: true
            });

            await ProductTransparencyDbModel.destroy({
                where: { productId: productIds },
                force: true
            });

            await ProductProducerDbModel.destroy({
                where: { productId: productIds },
                force: true
            });

            await ProductStoryDbModel.destroy({
                where: { productId: productIds },
                force: true
            });

            await ProductMaterialDbModel.destroy({
                where: { productId: productIds },
                force: true
            });

            await ProductImageDbModel.destroy({
                where: { productId: productIds },
                force: true
            });

            await ProductColorDbModel.destroy({
                where: { productId: productIds },
                force: true
            });

            await ProductPatternDbModel.destroy({
                where: { productId: productIds },
                force: true
            });

            await ProductCustomParameterDbModel.destroy({
                where: { productId: productIds },
                force: true
            });

            await ProductLocationDbModel.destroy({
                where: { productId: productIds },
                force: true
            });

            await ProductContentDbModel.destroy({
                where: { productId: productIds },
                force: true
            });

            await ProductRegionalShippingFeesDbModel.destroy({
                where: { productId },
                force: true
            });

            await ShopDbModel.destroy({
                where: { id: shop.id },
                force: true
            });

            await ProductAvailableNotificationDbModel.destroy({
                where: { productId },
                force: true
            })
        });

        describe('publish-Or-Unpublish', () => {

            it('publish product should insert notifications ', async () => {

                await unpublishProduct(productId, userToken);
                await publishProduct(productId, userToken);

                const notify = await ProductAvailableNotificationDbModel.findAll({ where: { productId } });

                expect(notify.length).toEqual(1);
                expect((notify[0] as any).productId).toEqual(productId);


            });

            it('unpublish product again should remove notifications', async () => {

                await unpublishProduct(productId, userToken);

                const notify = await ProductAvailableNotificationDbModel.findAll({ where: { productId } });

                expect(notify.length).toEqual(0);
            })

            it('should-insert-or-remove-notification-when-update-stock', async () => {

                await publishProduct(productId, userToken)

                await ProductAvailableNotificationDbModel.destroy({
                    where: { productId }
                })

                // change stock to 0->120 should insert to notification
                await request(app)
                    .patch(`/api/v1/products/${productId}/`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({ ...productData, stock: 0 });

                await request(app)
                    .patch(`/api/v1/products/${productId}/`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({ ...productData, stock: 120 });

                let notify = await ProductAvailableNotificationDbModel.findAll({ where: { productId } });

                expect(notify.length).toEqual(1);

                await request(app)
                    .patch(`/api/v1/products/${productId}/`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({ ...productData, stock: 0 });

                notify = await ProductAvailableNotificationDbModel.findAll({ where: { productId } });

                expect(notify.length).toEqual(0);

                await request(app)
                    .patch(`/api/v1/products/${productId}/`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({ ...productData, stock: 120 });

                notify = await ProductAvailableNotificationDbModel.findAll({ where: { productId } });

                expect(notify.length).toEqual(1);

                await request(app)
                    .patch(`/api/v1/products/${productId}/out-of-stock`)
                    .set('Authorization', `Bearer ${userToken}`);

                notify = await ProductAvailableNotificationDbModel.findAll({ where: { productId } });

                expect(notify.length).toEqual(0);

                // published again should insert notification

                await publishProduct(productId, userToken);
                notify = await ProductAvailableNotificationDbModel.findAll({ where: { productId } });

                expect(notify.length).toEqual(1);


            })

        });

    })

}

async function unpublishProduct(productId: number, userToken: string) {
    return await request(app)
        .patch(`/api/v1/products/${productId}/unpublish`)
        .set('Authorization', `Bearer ${userToken}`);
}

async function publishProduct(productId: number, userToken: string) {
    return await request(app)
        .patch(`/api/v1/products/${productId}/publish`)
        .set('Authorization', `Bearer ${userToken}`);
}

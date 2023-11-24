import _ from "lodash";
import { IUpdateProductParameterSetModel } from "../../../src/controllers/product/interfaces";
import {
    ProductAvailableNotificationDbModel,
    ProductColorDbModel,
    ProductCustomParameterDbModel,
    ProductDbModel,
    ProductParameterSetDbModel,
    ShopDbModel
} from "../../../src/database";
import { createTestShop } from '../helpers';
import { clearProductDataByIds } from "../helpers/product.helper";

const request = require('supertest');

const app = require('../index');

export const testAuditProductWithParameterSetsAvailable = () => {

    describe('AuditProductService', () => {
        let shop: any;
        let userToken: string;
        let productId: number;
        let productData: any;
        let colors: any;
        let others: any;

        beforeAll(async () => {
            shop = await createTestShop();
            userToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';

            productData = {
                hasParameters: true,
                story: {
                    content: '<p>The product story content</p>',
                    plainTextContent: '<p>「日本と中国と竹」</p>',
                    isOrigin: true,
                    summaryContent: 'this summary content data'
                },
                categoryId: 1,
                price: 3423,
                productWeight: 5,
                content: {
                    title: 'test',
                    subTitle: 'test',
                    annotation: 'test',
                    description: '<p>product description</p>'
                },
                language: 'en',
                isFreeShipment: true,
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
                customParameters: [
                    {
                        customParameter: 'logo',
                        displayPosition: 0,
                        isOrigin: true
                    },
                    {
                        customParameter: 'brand',
                        displayPosition: 2,
                        isOrigin: true
                    }
                ]

            };
            const res = await request(app)
                .post(`/api/v1/products/add`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(productData);

            productId = res.body.data.id;
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

            await ProductAvailableNotificationDbModel.destroy({
                where: { productId },
                force: true
            });

            await clearProductDataByIds(productIds);
            
            await ShopDbModel.destroy({
                where: { id: shop.id },
                force: true
            });
        });

        describe('publish-Or-Unpublish', () => {

            it('publish product should insert notifications ', async () => {

                ({ colors, others } = await insertParameterSets(colors, productId, others, userToken));
                await publishProduct(productId, userToken);
                await unpublishProduct(productId, userToken);
                await publishProduct(productId, userToken);

                const notify = await ProductAvailableNotificationDbModel.findAll({ where: { productId } });

                expect(notify.length).toEqual(colors.length * others.length);

            });

            it('unpublish product again should remove notifications', async () => {

                await unpublishProduct(productId, userToken);

                const notify = await ProductAvailableNotificationDbModel.findAll({ where: { productId } });

                expect(notify.length).toEqual(0);
            })

            it('should-insert-or-remove-notification when update product parameter sets', async () => {

                await publishProduct(productId, userToken);

                const paramSetsDb = await ProductParameterSetDbModel.findAll({
                    where: { productId },
                    attributes: ['id', 'colorId', 'customParameterId', 'price', 'stock', 'shipLaterStock', 'enable']
                }) as any[];

                const rawParamSets = convertToModel(paramSetsDb)
                rawParamSets[2].enable = false;

                // need remove
                rawParamSets[4].id = 0;

                const needRemoveColorId = rawParamSets[4].color;
                const needRemoveCustomParameterId = rawParamSets[4].customParameterId;

                const res = await request(app)
                    .post(`/api/v1/products/${productId}/parameter-sets`)
                    .set('Authorization', 'Bearer ' + userToken)
                    .send(rawParamSets);
                expect(res.statusCode).toEqual(200);

                const notify = await ProductAvailableNotificationDbModel.findAll({ where: { productId } }) as any[];
                expect(notify.length).toEqual(rawParamSets.length - 1);
                expect(notify.indexOf((x: any) => x.colorId == needRemoveColorId
                    && x.customParameterId == needRemoveCustomParameterId) == -1).toEqual(true);

            })

            it('should-insert-or-remove-notification when publish product', async () => {
                await unpublishProduct(productId, userToken);
                const paramSetsDb = await ProductParameterSetDbModel.findAll({
                    where: { productId },
                    attributes: ['id', 'colorId', 'customParameterId', 'price', 'stock', 'shipLaterStock', 'enable']
                }) as any[];

                const rawParamSets = convertToModel(paramSetsDb);
                rawParamSets.forEach((param: any) => {
                    param.enable = true;
                });

                rawParamSets[5].enable = false;
                rawParamSets[4].enable = false;

                const res = await request(app)
                    .post(`/api/v1/products/${productId}/parameter-sets`)
                    .set('Authorization', 'Bearer ' + userToken)
                    .send(rawParamSets);
                expect(res.statusCode).toEqual(200);

                await publishProduct(productId, userToken);

                const notify = await ProductAvailableNotificationDbModel.findAll({ where: { productId } }) as any[];
                expect(notify.length).toEqual(rawParamSets.length - 2);
            })
        });
    })
}

async function insertParameterSets(colors: any, productId: number, others: any, userToken: string) {
    colors = await ProductColorDbModel.findAll({ where: { productId } });
    others = await ProductCustomParameterDbModel.findAll({ where: { productId } });

    const parameterSets: any = [];

    for (const color of colors) {
        for (const other of others) {
            let parameterSet: Partial<IUpdateProductParameterSetModel>;

            parameterSet = {
                colorId: color.id,
                customParameterId: other.id,
                price: 123,
                stock: 100,
                enable: true
            };
            parameterSets.push(parameterSet);
        }
    }

    await request(app)
        .post(`/api/v1/products/${productId}/parameter-sets`)
        .set('Authorization', 'Bearer ' + userToken)
        .send(parameterSets);
    return { colors, others };
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


function convertToModel(paramSetsDb: any[]) {
    return JSON.parse(JSON.stringify(paramSetsDb))
        .map((x: any) => _.omit(x, ['productId', 'purchasedNumber', 'createdAt', 'updatedAt', 'deletedAt']))
}

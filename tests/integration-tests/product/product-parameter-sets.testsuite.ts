import _ from "lodash";
import { IUpdateProductParameterSetModel } from "../../../src/controllers/product/interfaces";
import { PRODUCT_PARAMETER_SETS_RELATE_MODEL } from "../../../src/dal";
import {
  ProductColorDbModel,
  ProductCustomParameterDbModel,
  ProductDbModel,
  ProductParameterSetDbModel,
  ShopDbModel,
  ShopImageDbModel
} from "../../../src/database";
import { createTestShop } from "../helpers";
import { clearProductDataByIds } from "../helpers/product.helper";

const request = require('supertest');
const app = require('..');

const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';

export const productParameterSetTest = () => {

  describe('PRODUCT PARAMETER SETS', () => {
    let shop: any;
    let productId: number;
    let productData: any;
    let colors: any;
    let others: any;

    beforeAll(async () => {
      shop = await createTestShop();

      productData = {
        story: {
          content: '<p>The product story content</p>',
          plainTextContent: '<p>「日本と中国と竹」</p>',
          isOrigin: true,
          summaryContent: 'this summary content data'
        },
        categoryId: 1,
        price: 3423,
        hasParameters: true,
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

      colors = await ProductColorDbModel.findAll({ where: { productId } });
      others = await ProductCustomParameterDbModel.findAll({ where: { productId } })
    });

    afterAll(async () => {
      const createdProductsList = await ProductDbModel.findAll({
        where: { userId: 9999 },
        attributes: ['id']
      });
      const productIds: number[] = createdProductsList.map(item => {
        return (item as any).id;
      });

      await clearProductDataByIds(productIds);

      await ShopImageDbModel.destroy({
        where: { shopId: shop.id },
        force: true
      });

      await ShopDbModel.destroy({
        where: { id: shop.id },
        force: true
      });
    });

    describe('POST', () => {
      it('return 401 when missing user token', async () => {
        const res = await request(app)
          .post(`/api/v1/products/${productId}/parameter-sets`)
          .send();

        expect(res.statusCode).toEqual(401)
      });

      it('return 404 when product does not exits.', async () => {
        const res = await request(app)
          .post(`/api/v1/products/${productId + 1000}/parameter-sets`)
          .set('Authorization', 'Bearer ' + userToken)
          .send([{
            colorId: 1,
            customParameterId: 1,
            price: 123,
            stock: 100,
            images: [{ imagePath: 'test.png' }],
            enable: false
          }]);
        expect(res.statusCode).toEqual(404);
      })

      it('return 400 when colorId = null and customParameterId = null', async () => {
        const res = await request(app)
          .post(`/api/v1/products/${productId}/parameter-sets`)
          .set('Authorization', 'Bearer ' + userToken)
          .send([{
            colorId: null,
            customParameterId: null,
            price: 123,
            stock: 100,
            images: [{ imagePath: 'test.png' }],
            enable: false
          }]);
        expect(res.statusCode).toEqual(400);
      })

      it('create return 200', async () => {
        const parameterSets: any = [];

        for (const color of colors) {
          for (const other of others) {
            let parameterSet: Partial<IUpdateProductParameterSetModel>;

            parameterSet = {
              colorId: color.id,
              customParameterId: other.id,
              price: 123,
              stock: 100,
              images: [{ imagePath: 'test.png' }, { imagePath: 'test2.png' }],
              enable: false
            }
            parameterSets.push(parameterSet);
          }
        }

        const res = await request(app)
          .post(`/api/v1/products/${productId}/parameter-sets`)
          .set('Authorization', 'Bearer ' + userToken)
          .send(parameterSets);
        expect(res.statusCode).toEqual(200)

        const created = await ProductParameterSetDbModel.findAll({
          where: { productId },
          include: [PRODUCT_PARAMETER_SETS_RELATE_MODEL.images]
        }) as any[];
        expect(created[0].price).toEqual(123);
        expect(created[0].stock).toEqual(100);
        expect(created[0].images.length).toEqual(2);
        expect(created[0].enable).toEqual(false);

      });

      it('update when id >0', async () => {
        const paramSetsDb = await ProductParameterSetDbModel.findAll({
          where: { productId },
          attributes: ['id', 'colorId', 'customParameterId', 'price', 'stock', 'shipLaterStock', 'enable'],
          include: [PRODUCT_PARAMETER_SETS_RELATE_MODEL.images]
        }) as any[];

        const rawParamSets = convertToModel(paramSetsDb)
        const otherNumber = 101;
        rawParamSets[0].price = otherNumber;
        rawParamSets[0].stock = otherNumber;

        const otherPath = 'test update image path.png';
        rawParamSets[0].images[0].imagePath = otherPath;

        const res = await request(app)
          .post(`/api/v1/products/${productId}/parameter-sets`)
          .set('Authorization', 'Bearer ' + userToken)
          .send(rawParamSets);
        expect(res.statusCode).toEqual(200)

        const updated = await ProductParameterSetDbModel.findAll({
          where: { productId },
          include: [PRODUCT_PARAMETER_SETS_RELATE_MODEL.images]
        }) as any[];

        expect(updated.length).toEqual(rawParamSets.length);
        expect(updated.filter(x => x.price === otherNumber).length).toEqual(1);
        expect(updated.filter(x => x.stock === otherNumber).length).toEqual(1);

        var images = _.flatten(updated.map(x => x.images))
        expect(images.length).toEqual(2 * rawParamSets.length);
        expect(images.filter(x => x.imagePath === otherPath).length).toEqual(1);

      });

      it('create when id > 0 and delete when id = 0 || null || undefined', async () => {
        const paramSetsDb = await ProductParameterSetDbModel.findAll({
          where: { productId },
          attributes: ['id', 'colorId', 'customParameterId', 'price', 'stock', 'shipLaterStock', 'enable'],
          include: [PRODUCT_PARAMETER_SETS_RELATE_MODEL.images]
        }) as any[];

        const rawParamSets = convertToModel(paramSetsDb);

        const needDeleteParamSetId = rawParamSets[0].id;
        delete rawParamSets[0].id;
        const otherNumber = 102;
        rawParamSets[0].price = otherNumber;
        rawParamSets[0].stock = otherNumber;

        const needDeleteImageId = rawParamSets[0].images[0].id;
        delete rawParamSets[0].images[0].id;
        const otherPath = 'image-other-path.png';
        rawParamSets[0].images[0].imagePath = otherPath;

        const res = await request(app)
          .post(`/api/v1/products/${productId}/parameter-sets`)
          .set('Authorization', 'Bearer ' + userToken)
          .send(rawParamSets);
        expect(res.statusCode).toEqual(200);

        const updated = await ProductParameterSetDbModel.findAll({
          where: { productId },
          include: [PRODUCT_PARAMETER_SETS_RELATE_MODEL.images]
        }) as any[];

        expect(updated.length).toEqual(rawParamSets.length);
        expect(updated.filter(x => x.price === otherNumber).length).toEqual(1);
        expect(updated.filter(x => x.stock === otherNumber).length).toEqual(1);
        expect(updated.filter(x => x.id === needDeleteParamSetId).length).toEqual(0);

        var images = _.flatten(updated.map(x => x.images));
        expect(images.filter(x => x.imagePath === otherPath).length).toEqual(1);
        expect(images.filter(x => x.id === needDeleteImageId).length).toEqual(0);
        expect(images.length).toEqual(2 * rawParamSets.length);

      });

      it('update stock to main product > 0', async () => {
        const paramSetsDb = await ProductParameterSetDbModel.findAll({
          where: { productId },
          attributes: ['id', 'colorId', 'customParameterId', 'price', 'stock', 'shipLaterStock', 'enable'],
          include: [PRODUCT_PARAMETER_SETS_RELATE_MODEL.images]
        }) as any[];

        const rawParamSets = convertToModel(paramSetsDb);
        for (const paramSet of rawParamSets) {
          paramSet.stock = 100;
          paramSet.enable = true;
        }

        const res = await request(app)
          .post(`/api/v1/products/${productId}/parameter-sets`)
          .set('Authorization', 'Bearer ' + userToken)
          .send(rawParamSets);
        expect(res.statusCode).toEqual(200);

        const mainProduct = await ProductDbModel.findByPk(productId, { attributes: ['stock'] }) as any;
        expect(mainProduct.stock).toEqual(100 * rawParamSets.length);

      })
    })

    describe('GET', () => {
      it('return 401 when missing user token', async () => {
        const res = await request(app)
          .get(`/api/v1/products/${productId}/parameter-sets`)
          .send();
        expect(res.statusCode).toEqual(401);
      });

      it('return 404 when product does not exits.', async () => {
        const res = await request(app)
          .get(`/api/v1/products/${productId + 1000}/parameter-sets`)
          .set('Authorization', 'Bearer ' + userToken)
          .send();
        expect(res.statusCode).toEqual(404);
      })

      it('return 200', async () => {
        const res = await request(app)
          .get(`/api/v1/products/${productId}/parameter-sets`)
          .set('Authorization', 'Bearer ' + userToken)
          .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toEqual(colors.length * others.length);
        expect(res.body.data.map((x: any) => x.images).flat().length).toEqual(2 * colors.length * others.length);

      })


    })

    describe('Chang status out of stock', () => {
      it('set stock = 0', async () => {
        await request(app)
          .patch(`/api/v1/products/${productId}/out-of-stock`)
          .set('Authorization', 'Bearer ' + userToken)
          .send();

        const res = await request(app)
          .get(`/api/v1/products/${productId}/parameter-sets`)
          .set('Authorization', 'Bearer ' + userToken)
          .send();

        expect(res.statusCode).toEqual(200);
        expect(res.body.data[0].stock).toEqual(0);
        expect(res.body.data.slice(-1)[0].stock).toEqual(0);
      })
    })
  })
}

function convertToModel(paramSetsDb: any[]) {
  return JSON.parse(JSON.stringify(paramSetsDb))
    .map((x: any) => _.omit(x, ['productId', 'purchasedNumber', 'createdAt', 'updatedAt', 'deletedAt']))
    .map((x: any) => { x.images = x.images.map((i: any) => _.omit(i, ['createdAt', 'updatedAt', 'deletedAt'])); return x; });
}

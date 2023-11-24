import { IUpdateProductParameterSetModel } from "../../../src/controllers/product/interfaces";
import {
  ProductColorDbModel,
  ProductCustomParameterDbModel,
  ProductDbModel,
  ShopDbModel
} from "../../../src/database";
import { createTestShop } from "../helpers";
import { clearProductDataByIds } from "../helpers/product.helper";

const request = require('supertest');
const app = require('../index');

const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';

export const getProductWithParameterSetsTest = () =>
  describe('Get-product-details-with-parameter-sets', () => {
    let shop: any;
    let productId: number;
    let productNameId: string;
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

      const createProductResponse = await request(app)
        .post(`/api/v1/products/add`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData);

      productId = createProductResponse.body.data.id;
      productNameId = createProductResponse.body.data.nameId;
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

      await ShopDbModel.destroy({
        where: { id: shop.id },
        force: true
      });
    });

    it('return 200 with product detail', async () => {

      colors = await ProductColorDbModel.findAll({ where: { productId } });
      others = await ProductCustomParameterDbModel.findAll({ where: { productId } })

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
            enable: true
          }
          parameterSets.push(parameterSet);
        }
      }

      await request(app)
        .post(`/api/v1/products/${productId}/parameter-sets`)
        .set('Authorization', 'Bearer ' + userToken)
        .send(parameterSets);

      const res = await request(app)
        .get(`/api/v1/products/${productNameId}`)
        .set('Authorization', 'Bearer ' + userToken)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).not.toBeNull();
      expect(res.body.data.parameterSets.length).toEqual(parameterSets.length);
    })
  });

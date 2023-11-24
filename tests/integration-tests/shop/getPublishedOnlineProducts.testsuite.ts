const request = require('supertest');
const app = require('../index');
import { Op } from 'sequelize';
import { ShopRepository } from '../../../src/dal';
import { userId, userToken } from "../constants";
import { clearProductDataByIds } from '../helpers/product.helper';
import { ProductDbModel, ProductStatusEnum, ShopDbModel, ShopStatusEnum } from '../../../src/database/models';
import { generateNameId } from '../../../src/helpers';

export const testGetPublishedOnlineProducts = () =>
  describe('GET PUBLISH ONLINE PRODUCTS BY NAMEID', () => {
    const shopRepository = new ShopRepository();
  
    let product: any;
    let productData: any;
    let shopData: any;

    beforeAll(async () => {
      shopData = {
        nameId: generateNameId(),
        userId,
        platformPercents: 5,
        isFeatured: true,
        status: ShopStatusEnum.PUBLISHED,
        email: 'test@email.com'
      };
      await shopRepository.create(shopData);

      productData = {
        price: 3423,
        content: {
          title: 'Title'
        },
        language: 'en',
        isFreeShipment: false,
        images: [
          {
            imagePath: 'https://localhost:9000',
            isOrigin: true
          }
        ],
        shippingFees: [
          {
            quantityFrom: 1,
            quantityTo: 10,
            shippingFee: 100,
            overseasShippingFee: null,
            regionalShippingFees: [
              {
                prefectureCode: "JP-47",
                shippingFee: null
              },
              {
                prefectureCode: "JP-01",
                shippingFee: null
              }
            ]
          }
        ]
      };

      const addOnlineProductRes = await request(app)
        .post(`/api/v1/products/add`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...productData,
          story: {
            content: '<p>The product story content</p>',
            plainTextContent: '<p>「日本と中国と竹」</p>',
            isOrigin: true
          },
          categoryId: 1,
          productWeight: 5
        });

      product = addOnlineProductRes.body.data;

      const addInstoreProductRes = await request(app)
        .post(`/api/v1/products/in-store/add`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData);

      const instoreProduct = addInstoreProductRes.body.data;

      await ProductDbModel.update(
        {
          status: ProductStatusEnum.PUBLISHED
        },
        { where: { id: [product.id, instoreProduct.id] } }
      );
    });

    afterAll(async () => {
      const createdProductsList = await ProductDbModel.findAll({
        where: {
          [Op.or]: [{ userId: 9999 }, { userId: 1111 }]
        },
        attributes: ['id']
      });
      const productIds: number[] = createdProductsList.map(item => {
        return (item as any).id;
      });

      await clearProductDataByIds(productIds);

      await ShopDbModel.destroy({
        where: { [Op.or]: [{ userId: 9999 }, { userId: 1111 }] },
        force: true
      });
    });

    it('should return status code 200 OK Request', async () => {
      const res = await request(app)
        .get(`/api/v1/shops/${shopData.nameId}/products`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).not.toBeUndefined();
      expect(res.body.data.products.count).toBeGreaterThan(0);
      expect(res.body.data.products.rows[0].price).toEqual(productData.price);
      expect(res.body.data.products.rows[0].status).toEqual(ProductStatusEnum.PUBLISHED);

    });
  });

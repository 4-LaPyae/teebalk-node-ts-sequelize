const request = require('supertest');
const app = require('../index');
import { Op } from 'sequelize';
import { ShopRepository } from '../../../src/dal';
import { userId, userToken } from "../constants";
import { clearProductDataByIds } from '../helpers/product.helper';
import { ProductDbModel, ProductStatusEnum, ShopDbModel, ShopStatusEnum } from '../../../src/database/models';
import { generateNameId } from '../../../src/helpers';

export const testGetPublishedInstoreProducts = () =>
  describe('GET PUBLISH INSTORE PRODUCTS BY NAMEID', () => {
    const shopRepository = new ShopRepository();
  
    let shop: any;
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
      shop = await shopRepository.create(shopData);

      productData = {
        price: 1000,
        stock: 23,
        shipLaterStock: 45,
        content: { title: 'Product Test 01', isOrigin: true },
        language: 'en',
        isFreeShipment: false,
        images: [{
          imagePath: 'https://localhost:9000',
          isOrigin: true
        }],
        shippingFees: [{
          quantityFrom: 1,
          quantityTo: 10,
          shippingFee: 1000,
          overseasShippingFee: null,
          regionalShippingFees: [{
            prefectureCode: "JP-47",
            shippingFee: null
          }, {
            prefectureCode: "JP-01",
            shippingFee: null
          }]
        }]
      };
      const res = await request(app)
        .post(`/api/v1/products/in-store/add`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData);
      product = res.body.data;

      await ProductDbModel.update(
        {
          status: ProductStatusEnum.PUBLISHED
        },
        { where: { id: product.id } }
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
        .get(`/api/v1/shops/${shopData.nameId}/instore-products`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).not.toBeUndefined();
      expect(res.body.data.length).toEqual(1);
      expect(res.body.data[0].price).toEqual(productData.price);
      expect(res.body.data[0].status).toEqual(ProductStatusEnum.PUBLISHED);
    });

    it('Return request status 400 Bad Request', async () => {
      const shopNameId = '1';
      const res = await request(app)
        .get(`/api/v1/shops/${shopNameId}/instore-products`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(400);
      expect(res.body.error.message).toEqual(`"nameId" with value "1" fails to match the required pattern: /(?!\\d+$)(^[a-zA-Z\\d]+$)/`);
    });

    it('Return request status 404 Not Found', async () => {
      const shopNameId = 'abcdefg';
      const res = await request(app)
        .get(`/api/v1/shops/${shopNameId}/instore-products`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.error.message).toEqual(`shop not found`);
    });

    it('should return error 404 Not load data of other seller', async () => {

      await ShopDbModel.update({ userId: 1111 }, { where: { id: shop.id } });
      
      const res = await request(app)
        .get(`/api/v1/shops/${shop.nameId}/instore-products`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body.error.message).toEqual(`Not found`);
    });
  });

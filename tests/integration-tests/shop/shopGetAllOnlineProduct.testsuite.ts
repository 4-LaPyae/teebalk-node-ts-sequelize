import { ShopRepository } from '../../../src/dal';
import {
  IProductContentModel,
  IProductModel,
  IShopModel,
  ProductContentDbModel,
  ProductDbModel,
  SalesMethodEnum,
  ShopDbModel,
  ShopStatusEnum
} from '../../../src/database/models';
import { IProduct } from '../../../src/services';
import { clearProductDataByIds } from '../helpers/product.helper';

interface ICreateProductResult {
  product: IProductModel;
  content: IProductContentModel;
}

const request = require('supertest');
const app = require('../index');
const loggedInUserId = 9999;
const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';

export const shopGetAllOnlineProduct = () => {
  describe('SHOP GET ALL ONLINE PRODUCT', () => {
    let shop: IShopModel;
    let otherShop: IShopModel;
    let sequenceNumber = 0;

    const createProduct = async (title: string, shop: IShopModel, price: number, purchasedNumber: number, stock: number): Promise<ICreateProductResult> => {
      const product: IProductModel = await ProductDbModel.create<any>({
        shopId: shop.id,
        userId: shop.userId,
        nameId: `productnameid${sequenceNumber}`,
        categoryId: 1,
        price: price,
        purchasedNumber: purchasedNumber,
        stock: stock,
        salesMethod: SalesMethodEnum.ONLINE,
        hasParameters: true,
        productWeight: 5,
        language: 'en',
        isFreeShipment: true
      });

      const content: IProductContentModel = await ProductContentDbModel.create<any>({
        productId: product.id,
        title: title,
        subTitle: 'sub title test',
        annotation: 'annotation test',
        description: 'desc'
      });

      sequenceNumber++;

      return { product, content };
    };

    beforeAll(async () => {
      shop = await new ShopRepository().create({
        nameId: 'testshop',
        userId: loggedInUserId,
        isFeatured: true,
        status: ShopStatusEnum.PUBLISHED,
        email: 'testshop@email.com'
      });

      otherShop = await new ShopRepository().create({
        nameId: 'testothershop',
        userId: 9998,
        isFeatured: true,
        status: ShopStatusEnum.PUBLISHED,
        email: 'testothershop@email.com'
      });

      await createProduct('Product test 1', otherShop, 1000, 5, 10);
      await createProduct('Product test 2', shop, 1500, 6, 15);
      await createProduct('Product test 3', shop, 1700, 8, 20);
      await createProduct('Product tells test 4', shop, 1900, 10, 22);
      await createProduct('Product test 5', shop, 2100, 12, 24);
      await createProduct('Product test 6', shop, 2300, 14, 26);
      await createProduct('Product test 7 tells', shop, 2500, 16, 28);
      await createProduct('Tells Product test 8', shop, 2700, 18, 30);
    });

    afterAll(async () => {
      const shopIds = [shop.id, otherShop.id];

      await ShopDbModel.destroy({
        where: { id: shopIds },
        force: true
      });
      
      const createdProductsList = await ProductDbModel.findAll({
        where: {
          shopId: shopIds
        },
        attributes: ['id']
      });
      const productIds: number[] = createdProductsList.map(item => {
        return (item as any).id;
      });

      await clearProductDataByIds(productIds);
    });

    
    describe('request API successful', () => {
      it('no search text, should return all data', async () => {
        const response = await request(app)
          .get(`/api/v1/shops/${shop.nameId}/all-online-products?limit=10&pageNumber=1`)
          .set('Authorization', `Bearer ${userToken}`)
          .send();

        expect(response.body).toBeDefined();
        expect(response.body.count).toEqual(7);
      });

      it('should return correct paging', async () => {
        // page 1
        let response = await request(app)
          .get(`/api/v1/shops/${shop.nameId}/all-online-products?limit=5&pageNumber=1`)
          .set('Authorization', `Bearer ${userToken}`)
          .send();

        expect(response.body).toBeDefined();
        expect(response.body.count).toEqual(7);
        expect(response.body.data.length).toEqual(5);
        expect(response.body.metadata.totalPages).toEqual(2);

        // page 2
        response = await request(app)
          .get(`/api/v1/shops/${shop.nameId}/all-online-products?limit=5&pageNumber=2`)
          .set('Authorization', `Bearer ${userToken}`)
          .send();

        expect(response.body).toBeDefined();
        expect(response.body.count).toEqual(7);
        expect(response.body.data.length).toEqual(2);
        expect(response.body.metadata.totalPages).toEqual(2);
      });

      it('has search text, should return correct data', async () => {
        const searchText = 'tells';

        const response = await request(app)
          .get(`/api/v1/shops/${shop.nameId}/all-online-products?limit=10&pageNumber=1&searchText=${searchText}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send();

        expect(response.body).toBeDefined();

        const products: IProduct[] = response.body.data;

        expect(products.length).toEqual(3);
        expect(products.map(p => p.content.title).every(t => /tells/i.test(t || ''))).toBeTruthy();
      });

      it('sort by price, should return correct data', async () => {
        let response = await request(app)
          .get(`/api/v1/shops/${shop.nameId}/all-online-products?limit=10&pageNumber=1&sort=price,DESC`)
          .set('Authorization', `Bearer ${userToken}`)
          .send();

        expect(response.body).toBeDefined();

        let products: IProduct[] = response.body.data;

        expect(products.length).toEqual(7);

        for (let i = 0; i < products.length - 1; i++) {
          const nextProduct = products[i+1];
          expect(products[i].price).toBeGreaterThanOrEqual(nextProduct.price as number);
        }

        response = await request(app)
          .get(`/api/v1/shops/${shop.nameId}/all-online-products?limit=10&pageNumber=1&sort=price,ASC`)
          .set('Authorization', `Bearer ${userToken}`)
          .send();

        expect(response.body).toBeDefined();

        products = response.body.data;

        expect(products.length).toEqual(7);

        for (let i = 0; i < products.length - 1; i++) {
          const nextProduct = products[i+1];
          expect(products[i].price).toBeLessThanOrEqual(nextProduct.price as number);
        }
      });

      it('sort by purchasedNumber, should return correct data', async () => {
        let response = await request(app)
          .get(`/api/v1/shops/${shop.nameId}/all-online-products?limit=10&pageNumber=1&sort=mostpurchases,DESC`)
          .set('Authorization', `Bearer ${userToken}`)
          .send();

        expect(response.body).toBeDefined();

        let products: IProduct[] = response.body.data;

        expect(products.length).toEqual(7);

        for (let i = 0; i < products.length - 1; i++) {
          const nextProduct = products[i+1];
          expect(products[i].purchasedNumber).toBeGreaterThanOrEqual(nextProduct.purchasedNumber as number);
        }

        response = await request(app)
          .get(`/api/v1/shops/${shop.nameId}/all-online-products?limit=10&pageNumber=1&sort=mostpurchases,ASC`)
          .set('Authorization', `Bearer ${userToken}`)
          .send();

        expect(response.body).toBeDefined();

        products = response.body.data;

        expect(products.length).toEqual(7);

        for (let i = 0; i < products.length - 1; i++) {
          const nextProduct = products[i+1];
          expect(products[i].purchasedNumber).toBeLessThanOrEqual(nextProduct.purchasedNumber as number);
        }
      });

      it('sort by stock, should return correct data', async () => {
        let response = await request(app)
          .get(`/api/v1/shops/${shop.nameId}/all-online-products?limit=10&pageNumber=1&sort=stock,DESC`)
          .set('Authorization', `Bearer ${userToken}`)
          .send();

        expect(response.body).toBeDefined();

        let products: IProduct[] = response.body.data;

        expect(products.length).toEqual(7);

        for (let i = 0; i < products.length - 1; i++) {
          const nextProduct = products[i+1];
          expect(products[i].stock).toBeGreaterThanOrEqual(nextProduct.stock as number);
        }

        response = await request(app)
          .get(`/api/v1/shops/${shop.nameId}/all-online-products?limit=10&pageNumber=1&sort=stock,ASC`)
          .set('Authorization', `Bearer ${userToken}`)
          .send();

        expect(response.body).toBeDefined();

        products = response.body.data;

        expect(products.length).toEqual(7);

        for (let i = 0; i < products.length - 1; i++) {
          const nextProduct = products[i+1];
          expect(products[i].stock).toBeLessThanOrEqual(nextProduct.stock as number);
        }
      });
    });


    describe('request API fail', () => {
      it('access other shop, should return 404 error', async () => {
        const response = await request(app)
          .get(`/api/v1/shops/${otherShop.nameId}/all-online-products`)
          .set('Authorization', `Bearer ${userToken}`)
          .send();

        expect(response.body).toBeDefined();
        expect(response.body.error.statusCode).toEqual(404);
      });
    });
  });
}

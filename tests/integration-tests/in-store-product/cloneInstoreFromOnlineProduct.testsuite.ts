import {
  IProductColorModel,
  IProductContentModel,
  IProductCustomParameterModel,
  IProductImageModel,
  IProductModel,
  IProductParameterSetModel,
  IProductRegionalShippingFeesModel,
  IProductShippingFeesModel,
  ProductColorDbModel,
  ProductContentDbModel,
  ProductCustomParameterDbModel,
  ProductDbModel,
  ProductImageDbModel,
  ProductParameterSetDbModel,
  ProductRegionalShippingFeesDbModel,
  ProductShippingFeesDbModel,
  ProductStatusEnum,
  SalesMethodEnum,
  ShopDbModel
} from '../../../src/database/models';
import { zeroPaddingID } from '../../../src/helpers';
import { userId, userToken } from '../constants';
import { clearTestShopDataById, createTestShop } from '../helpers';
import { clearProductDataByIds } from '../helpers/product.helper';

interface ICreateProductResult {
  product: IProductModel;
  content: IProductContentModel;
  images: IProductImageModel[];
  color: IProductColorModel;
  customParameter: IProductCustomParameterModel;
  parameterSet: IProductParameterSetModel;
  shippingFee: IProductShippingFeesModel;
  regionalShippingFee: IProductRegionalShippingFeesModel;
}

const request = require('supertest');
const app = require('../index');
const loggedInUserId = userId;

export const testCloneInstoreFromOnlineProduct = () => {
  describe('CLONE INSTORE FROM ONLINE PRODUCT', () => {
    let shop: any;
    let sequenceNumber = 0;

    const createProduct = async (salesMethod: SalesMethodEnum): Promise<ICreateProductResult> => {
      const product: IProductModel = await ProductDbModel.create<any>({
        shopId: shop.id,
        userId: loggedInUserId,
        nameId: `Test product ${sequenceNumber}`,
        categoryId: 1,
        price: 1000,
        stock: 10,
        shipLaterStock: 5,
        salesMethod: salesMethod,
        hasParameters: true,
        productWeight: 5,
        language: 'en',
        isFreeShipment: true,
        displayPosition: salesMethod == SalesMethodEnum.INSTORE ? sequenceNumber : null
      });

      const content: IProductContentModel = await ProductContentDbModel.create<any>({
        productId: product.id,
        title: `Title ${sequenceNumber}`,
        subTitle: 'sub title test',
        annotation: 'annotation test',
        description: 'desc'
      });

      const image1: IProductImageModel = await ProductImageDbModel.create<any>({
        productId: product.id,
        imagePath: `https://localhost:9000/${sequenceNumber}`,
        isOrigin: true
      });

      const image2: IProductImageModel = await ProductImageDbModel.create<any>({
        productId: product.id,
        imagePath: `https://localhost:9000/${sequenceNumber+1}`,
        isOrigin: true
      });

      const color: IProductColorModel = await ProductColorDbModel.create<any>({
        productId: product.id,
        color: `Color ${sequenceNumber}`,
        displayPosition: sequenceNumber,
        isOrigin: true
      });

      const customParameter: IProductCustomParameterModel = await ProductCustomParameterDbModel.create<any>({
        productId: product.id,
        customParameter: `Custom ${sequenceNumber}`,
        displayPosition: sequenceNumber,
        isOrigin: true
      });

      const parameterSet: IProductParameterSetModel = await ProductParameterSetDbModel.create<any>({
        productId: product.id,
        colorId: color.id,
        customParameterId: customParameter.id,
        price: sequenceNumber,
        stock: sequenceNumber,
        purchasedNumber: sequenceNumber,
        enable: true,
        shipLaterStock: sequenceNumber
      });

      const shippingFee: IProductShippingFeesModel = await ProductShippingFeesDbModel.create<any>({
        productId: product.id,
        quantityFrom: sequenceNumber,
        quantityTo: sequenceNumber + 1,
        shippingFee: sequenceNumber,
        overseasShippingFee: sequenceNumber
      });

      const regionalShippingFee: IProductRegionalShippingFeesModel = await ProductRegionalShippingFeesDbModel.create<any>({
        productId: product.id,
        prefectureCode: 'JP-01',
        shippingFee: sequenceNumber
      });

      sequenceNumber++;

      return { product, content, images: [image1, image2], color, customParameter, parameterSet, shippingFee, regionalShippingFee };
    };

    beforeAll(async () => {
      shop = await createTestShop();
    });

    afterAll(async () => {
      await ShopDbModel.destroy({
        where: { id: shop.id },
        force: true
      });

      const createdProductsList = await ProductDbModel.findAll({
        where: {
          userId: loggedInUserId
        },
        attributes: ['id']
      });
      const productIds: number[] = createdProductsList.map(item => {
        return (item as any).id;
      });

      await Promise.all([
        clearProductDataByIds(productIds),
        clearTestShopDataById([shop.id])
      ]);
    });


    describe('Clone product successful', () => {
      it('should clone all instore data, displayPosition should equal id', async () => {
        let originalProductData: ICreateProductResult[] = [];

        for (let i = 1; i <= 3; i++) {
          const createdProductData = await createProduct(SalesMethodEnum.ONLINE);
          originalProductData.push(createdProductData);
        }

        const requestData = {
          ids: originalProductData.map(p => p.product.id)
        };

        const cloneProductResponse = await request(app)
          .post(`/api/v1/products/in-store/clone-from-online`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(cloneProductResponse.statusCode).toEqual(200);
        expect(cloneProductResponse.body.data).toBeDefined();
        expect(cloneProductResponse.body.data.nameIds).toBeDefined();
        const product = await ProductDbModel.findOne({ where: { nameId: cloneProductResponse.body.data.nameIds[0] } }) as any;
        expect(product.code).toBe(`${zeroPaddingID(shop.id, 4)}-${zeroPaddingID(product.id, 4)}`);

        const clonedProducts: IProductModel[] = await ProductDbModel.findAll<any>({
          where: {
            nameId: cloneProductResponse.body.data.nameIds
          }
        });

        expect(clonedProducts.length).toEqual(originalProductData.length);

        for (const clonedProduct of clonedProducts) {
          const content: IProductContentModel = await ProductContentDbModel.findOne<any>({
            where: {
              productId: clonedProduct.id
            }
          });

          const images: IProductImageModel[] = await ProductImageDbModel.findAll<any>({
            where: {
              productId: clonedProduct.id
            }
          });

          const color: IProductColorModel = await ProductColorDbModel.findOne<any>({
            where: {
              productId: clonedProduct.id
            }
          });

          const customParameter: IProductCustomParameterModel = await ProductCustomParameterDbModel.findOne<any>({
            where: {
              productId: clonedProduct.id
            }
          });

          const parameterSet: IProductParameterSetModel = await ProductParameterSetDbModel.findOne<any>({
            where: {
              productId: clonedProduct.id
            }
          });

          const shippingFee: IProductShippingFeesModel = await ProductShippingFeesDbModel.findOne<any>({
            where: {
              productId: clonedProduct.id
            }
          });

          const regionalShippingFee: IProductRegionalShippingFeesModel = await ProductRegionalShippingFeesDbModel.findOne<any>({
            where: {
              productId: clonedProduct.id
            }
          });

          const originalProduct = originalProductData.find(p => `(COPY) ${p.content.title}` === content.title)

          expect(originalProduct).toBeDefined();
          expect(clonedProduct.displayPosition).toEqual(clonedProduct.id);
          expect(clonedProduct.salesMethod).toEqual(SalesMethodEnum.INSTORE);
          expect(clonedProduct.userId).toBe(loggedInUserId);
          expect(clonedProduct.status).toBe(ProductStatusEnum.DRAFT);
          expect(clonedProduct.stock).toEqual(0);
          expect(clonedProduct.shipLaterStock).toEqual(0);

          expect(content.title).toEqual('(COPY) ' + originalProduct?.content.title);

          expect(images.length).toEqual(1);
          expect(images[0].imagePath).toEqual(originalProduct?.images[0].imagePath);

          expect(color.color).toEqual(originalProduct?.color.color);
          expect(customParameter.customParameter).toEqual(originalProduct?.customParameter.customParameter);

          expect(parameterSet.colorId).toEqual(color.id);
          expect(parameterSet.customParameterId).toEqual(customParameter.id);

          expect(parameterSet.stock).toEqual(0);
          expect(parameterSet.shipLaterStock).toEqual(0);

          expect(shippingFee.quantityFrom).toEqual(originalProduct?.shippingFee.quantityFrom);
          expect(shippingFee.quantityTo).toEqual(originalProduct?.shippingFee.quantityTo);
          expect(shippingFee.shippingFee).toEqual(originalProduct?.shippingFee.shippingFee);
          expect(shippingFee.overseasShippingFee).toEqual(originalProduct?.shippingFee.overseasShippingFee);

          expect(regionalShippingFee.prefectureCode).toEqual(originalProduct?.regionalShippingFee.prefectureCode);
          expect(regionalShippingFee.shippingFee).toEqual(originalProduct?.regionalShippingFee.shippingFee);
        }
      });
    });


    describe('Clone product fail', () => {
      it('if any product not found, should return 409 error', async () => {
        const createdProductData = await createProduct(SalesMethodEnum.ONLINE);

        const requestData = {
          ids: [999999, createdProductData.product.id]
        };

        const cloneProductResponse = await request(app)
          .post(`/api/v1/products/in-store/clone-from-online`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(cloneProductResponse.body).toBeDefined();
        expect(cloneProductResponse.body.error.statusCode).toEqual(409);
        expect(cloneProductResponse.body.error.message).toEqual('ProductIsUnavailableForClone');
      });

      it('if any instore product in the list, should return 409 error', async () => {
        const createdProductData1 = await createProduct(SalesMethodEnum.INSTORE);
        const createdProductData2 = await createProduct(SalesMethodEnum.ONLINE);
        const createdProductData3 = await createProduct(SalesMethodEnum.ONLINE);

        const requestData = {
          ids: [createdProductData1.product.id, createdProductData2.product.id, createdProductData3.product.id]
        };

        const cloneProductResponse = await request(app)
          .post(`/api/v1/products/in-store/clone-from-online`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestData) as any;

        expect(cloneProductResponse.body).toBeDefined();
        expect(cloneProductResponse.body.error.statusCode).toEqual(409);
        expect(cloneProductResponse.body.error.message).toEqual('ProductIsUnavailableForClone');
      });
    });
  });
}

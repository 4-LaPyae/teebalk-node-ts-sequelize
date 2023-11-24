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
  SalesMethodEnum
} from '../../../src/database/models';
import { zeroPaddingID } from '../../../src/helpers';
import { userId, userToken } from '../constants';
import { clearProductDataByIds, clearTestShopDataById, createTestShop } from '../helpers';

interface ICreateProductResult {
  product: IProductModel;
  content: IProductContentModel;
  image: IProductImageModel;
  color: IProductColorModel;
  customParameter: IProductCustomParameterModel;
  parameterSet: IProductParameterSetModel;
  shippingFee: IProductShippingFeesModel;
  regionalShippingFee: IProductRegionalShippingFeesModel;
}

const request = require('supertest');
const app = require('../index');
const loggedInUserId = userId;

export const testCloneInstoreProduct = () => {
  describe('CLONE INSTORE PRODUCT', () => {
    let shop: any;
    let sequenceNumber = 0;

    const createProduct = async (salesMethod: SalesMethodEnum, displayPosition: number): Promise<ICreateProductResult> => {
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
        displayPosition: displayPosition
      });

      const content: IProductContentModel = await ProductContentDbModel.create<any>({
        productId: product.id,
        title: `Title ${sequenceNumber}`,
        subTitle: 'sub title test',
        annotation: 'annotation test',
        description: 'desc'
      });

      const image: IProductImageModel = await ProductImageDbModel.create<any>({
        productId: product.id,
        imagePath: `https://localhost:9000/${sequenceNumber}`,
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

      return { product, content, image, color, customParameter, parameterSet, shippingFee, regionalShippingFee };
    };

    beforeAll(async () => {
      shop = await createTestShop();
    });

    afterAll(async () => {
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

    describe('Clone product successfull', () => {
      it('display position should be updated correctly', async () => {
        
        let listCreatedProductData: ICreateProductResult[] = [];

        for (let i = 1; i <= 10; i++) {
          const createdProductData = await createProduct(SalesMethodEnum.INSTORE, i);
          listCreatedProductData.push(createdProductData);
        }

        const productDataToClone = listCreatedProductData.find(p => p.product.displayPosition == 3);

        const cloneProductResponse = await request(app)
          .post(`/api/v1/products/in-store/${productDataToClone?.product.id}/clone`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(cloneProductResponse.statusCode).toEqual(200);
        expect(cloneProductResponse.body.data).toBeDefined();
        expect(cloneProductResponse.body.data.nameId).toBeDefined();
        const product = await ProductDbModel.findOne({ where: { nameId: cloneProductResponse.body.data.nameId } }) as any;
        expect(product.code).toBe(`${zeroPaddingID(shop.id, 4)}-${zeroPaddingID(product.id, 4)}`);


        const clonedProduct: IProductModel = await ProductDbModel.findOne<any>({
          where: {
            nameId: cloneProductResponse.body.data.nameId
          }
        });

        const content: IProductContentModel = await ProductContentDbModel.findOne<any>({
          where: {
            productId: clonedProduct.id
          }
        });
  
        const image: IProductImageModel = await ProductImageDbModel.findOne<any>({
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

        expect(clonedProduct.displayPosition).toEqual(4);
        expect(clonedProduct.userId).toBe(loggedInUserId);
        expect(clonedProduct.status).toBe(ProductStatusEnum.DRAFT);
        expect(clonedProduct.stock).toBe(productDataToClone?.product.stock);
        expect(clonedProduct.shipLaterStock).toBe(productDataToClone?.product.shipLaterStock);

        expect(content.title).toEqual('(COPY) ' + productDataToClone?.content.title);

        expect(image.imagePath).toEqual(productDataToClone?.image.imagePath);

        expect(color.color).toEqual(productDataToClone?.color.color);
        expect(customParameter.customParameter).toEqual(productDataToClone?.customParameter.customParameter);
        expect(parameterSet.colorId).toEqual(color.id);
        expect(parameterSet.customParameterId).toEqual(customParameter.id);
        expect(parameterSet.stock).toEqual(productDataToClone?.parameterSet.stock);
        expect(parameterSet.shipLaterStock).toEqual(productDataToClone?.parameterSet.shipLaterStock);

        expect(shippingFee.quantityFrom).toEqual(productDataToClone?.shippingFee.quantityFrom);
        expect(shippingFee.quantityTo).toEqual(productDataToClone?.shippingFee.quantityTo);
        expect(shippingFee.shippingFee).toEqual(productDataToClone?.shippingFee.shippingFee);
        expect(shippingFee.overseasShippingFee).toEqual(productDataToClone?.shippingFee.overseasShippingFee);

        expect(regionalShippingFee.prefectureCode).toEqual(productDataToClone?.regionalShippingFee.prefectureCode);
        expect(regionalShippingFee.shippingFee).toEqual(productDataToClone?.regionalShippingFee.shippingFee);
      });
    });

    describe('Clone product fail', () => {
      it('product not found, should return 409 error', async () => {
        const cloneProductResponse = await request(app)
          .post(`/api/v1/products/in-store/999999/clone`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(cloneProductResponse.body).toBeDefined();
        expect(cloneProductResponse.body.error.statusCode).toEqual(409);
        expect(cloneProductResponse.body.error.message).toEqual('ProductIsUnavailableForClone');
      });
    });
  });
}

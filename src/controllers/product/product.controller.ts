import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';

import { LanguageEnum, TopProductTypeEnum } from '../../constants';
import { IProductDao, IProductDisplayPositionModel, IProductNearbyModel, IProductParameterSetDao } from '../../dal';
import { ITopProductDao } from '../../dal/top-product/interfaces';
import {
  IProductColorModel,
  IProductCustomParameterModel,
  IProductModel,
  IShopModel,
  ProductStatusEnum,
  SalesMethodEnum,
  Transactional
} from '../../database';
import { ApiError } from '../../errors';
import { cloneProductTitle } from '../../helpers/clone-product-title.helper';
import { LogMethodSignature } from '../../logger';
import { AuditTypes } from '../../services/product/constants';
import { BaseController } from '../_base/base.controller';

import {
  ICountProductsByStatus,
  ICreateProductModel,
  IProductControllerServices,
  IProductPaginationOptions,
  IProductsList,
  IProductsListSearch,
  IProductSortQuery,
  ISearchQuery,
  IUpdateProductModel,
  IUpdateProductParameterSetModel
} from './interfaces';

const log = new Logger('CTR:ProductController');

export class ProductController extends BaseController<IProductControllerServices> {
  @LogMethodSignature(log)
  async getAllOnlineProducts(shopId: number, sortQuery: IProductSortQuery): Promise<IProductsList> {
    if (!shopId) {
      throw ApiError.badRequest('Parameter "shopId" should not be empty');
    }
    const products = await this.services.productService.getAllProducts(shopId, SalesMethodEnum.ONLINE, sortQuery);
    return products;
  }

  @LogMethodSignature(log)
  async getAllInstoreProducts(shopId: number, options: IProductPaginationOptions): Promise<IProductsList> {
    if (!shopId) {
      throw ApiError.badRequest('Parameter "shopId" should not be empty');
    }
    const productsInstore = await this.services.productService.getAllProducts(shopId, SalesMethodEnum.INSTORE, options);
    return productsInstore;
  }

  @LogMethodSignature(log)
  async getPublishedOnlineProductList(userId: number, options: IProductPaginationOptions): Promise<IProductsList> {
    if (!userId) {
      throw ApiError.badRequest('Parameter "userId" should not be empty');
    }

    const result = await this.services.productService.getList(userId, [ProductStatusEnum.PUBLISHED], SalesMethodEnum.ONLINE, options);
    return result;
  }

  @LogMethodSignature(log)
  async getUnpublishedOnlineProductList(userId: number, options: IProductPaginationOptions): Promise<IProductsList> {
    if (!userId) {
      throw ApiError.badRequest('Parameter "userId" should not be empty');
    }

    const result = await this.services.productService.getList(
      userId,
      [ProductStatusEnum.DRAFT, ProductStatusEnum.UNPUBLISHED],
      SalesMethodEnum.ONLINE,
      options
    );
    return result;
  }

  @LogMethodSignature(log)
  async queryByLocation(options: { lng: number; lat: number }, userId?: number): Promise<IProductNearbyModel[]> {
    if (!options.lat || !options.lng) {
      return [];
    }

    const products = await this.services.productService.getProductsNearByGeolocation(options.lng, options.lat);
    await this.services.inventoryService.loadMainProductStockQuantity(products, userId);

    return products;
  }

  @LogMethodSignature(log)
  async getTopOnlineProductList(type: TopProductTypeEnum, options: IProductPaginationOptions, userId?: number): Promise<ITopProductDao[]> {
    const productList = await this.services.productService.getTopList(type, options);

    await this.services.inventoryService.loadMainProductStockQuantity(productList, userId);

    return productList;
  }

  @LogMethodSignature(log)
  async getOnlineProductByNameId(nameId: string, userId?: number, options?: { language?: LanguageEnum }) {
    if (!nameId) {
      throw new Error('Parameter "productNameId" should not be empty');
    }

    const product = await this.services.productService.getOnlineProductByNameId(nameId, 1, options?.language);
    if (!product) {
      throw ApiError.notFound();
    }
    await this.services.inventoryService.loadAvailabeStock(product, userId);

    return product;
  }

  @LogMethodSignature(log)
  async getInstoreProductByNameId(product: IProductDao, userId?: number, orderNameId?: string) {
    if (!product) {
      throw new Error('"product" should not be empty');
    }

    let instoreOrderGroup = null;
    if (orderNameId) {
      instoreOrderGroup = await this.services.instoreOrderService.findOneOrderGroup({
        where: { nameId: orderNameId },
        attributes: ['id']
      });
    }

    await this.services.inventoryService.loadAvailabeStock(product, userId, instoreOrderGroup?.id);

    return product;
  }

  @LogMethodSignature(log)
  @Transactional
  async create(
    userId: number,
    shop: IShopModel,
    product: ICreateProductModel,
    salesMethod: SalesMethodEnum = SalesMethodEnum.ONLINE,
    transaction?: Transaction
  ) {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }
    if (!product) {
      throw new Error('Parameter "product" should not be empty');
    }

    product.nameId = product.nameId || this.services.productService.generateNameId();

    const rarenessTotalPoint = await this.services.rarenessLevelService.calcRarenessTotalPoint(
      product.transparency?.highlightPoints,
      product.transparency?.rarenessLevel
    );

    // Create product
    const createdProduct = await this.services.productService.create(
      userId,
      shop.id,
      {
        ...product,
        rarenessTotalPoint,
        salesMethod
      },
      transaction
    );

    // Generate code for instore product
    if (salesMethod === SalesMethodEnum.INSTORE) {
      await this.services.productService.updateInstoreProductCode(shop.id, createdProduct.id, transaction);
    }

    // Create product categories
    if (product.categoryId) {
      await this.services.productCategoryService.create(createdProduct.id, product.categoryId, transaction);
    }

    // Create product parameters
    if (product.colors) {
      await this.services.productColorService.bulkCreate(createdProduct.id, product.colors, transaction);
    }

    if (product.patterns) {
      await this.services.productPatternService.bulkCreate(createdProduct.id, product.patterns, transaction);
    }

    if (product.customParameters) {
      await this.services.productCustomParameterService.bulkCreate(createdProduct.id, product.customParameters, transaction);
    }

    // Create product story
    if (product.story) {
      await this.services.productStoryService.create(createdProduct.id, product.story, transaction);
    }

    // Create product content
    if (product.content) {
      await this.services.productContentService.create(createdProduct.id, product.content, transaction);
    }

    // Create product images
    if (product.images) {
      await this.services.productImageService.bulkCreate(createdProduct.id, product.images, transaction);
    }

    // Create product shipment prefecture
    if (product.regionalShippingFees) {
      await this.services.productRegionalShippingFeesService.bulkCreate(createdProduct.id, product.regionalShippingFees, transaction);
    }

    if (product.shippingFees) {
      await this.services.productShippingFeesService.bulkCreate(createdProduct.id, product.shippingFees, transaction);
    }

    return {
      id: createdProduct.id,
      nameId: createdProduct.nameId
    };
  }

  @LogMethodSignature(log)
  @Transactional
  async clone(productId: number, transaction?: Transaction) {
    const productNameId = this.services.productService.generateNameId();

    const product = await this.services.productService.getOneById(productId);

    delete product.id;

    const createdProduct = await this.services.productService.clone(product, productNameId, transaction);

    const createProductDetails: Promise<any>[] = [];

    // Clone product categories
    if (product.categories) {
      createProductDetails.push(this.services.productCategoryService.bulkCreate(createdProduct.id, product.categories, transaction));
    }

    if (product.patterns) {
      createProductDetails.push(this.services.productPatternService.bulkCreate(createdProduct.id, product.patterns, transaction));
    }

    // Clone product story
    if (product.stories) {
      createProductDetails.push(this.services.productStoryService.bulkCreate(createdProduct.id, product.stories, transaction));
    }

    // Clone product content
    if (product.contents) {
      product.contents.forEach(item => (item.title ? (item.title = cloneProductTitle(item.title)) : null));
      createProductDetails.push(this.services.productContentService.bulkCreate(createdProduct.id, product.contents, transaction));
    }

    // Clone product images
    if (product.images) {
      createProductDetails.push(this.services.productImageService.bulkCreate(createdProduct.id, product.images, transaction));
    }

    // Clone product shipment prefecture
    if (product.regionalShippingFees) {
      createProductDetails.push(
        this.services.productRegionalShippingFeesService.bulkCreate(createdProduct.id, product.regionalShippingFees, transaction)
      );
    }

    if (product.shippingFees) {
      createProductDetails.push(this.services.productShippingFeesService.bulkCreate(createdProduct.id, product.shippingFees, transaction));
    }

    await Promise.all(createProductDetails);

    // Clone product parameters
    const [productColors, productCustomParameters] = await Promise.all([
      product.colors ? this.services.productColorService.bulkCreate(createdProduct.id, product.colors, transaction) : [],
      product.customParameters
        ? this.services.productCustomParameterService.bulkCreate(createdProduct.id, product.customParameters, transaction)
        : []
    ]);

    if (product.hasParameters) {
      await this.services.productParameterSetService.cloneParameterSets(
        createdProduct.id,
        product.parameterSets,
        productColors,
        productCustomParameters,
        transaction
      );
    }

    return {
      nameId: productNameId
    };
  }

  @LogMethodSignature(log)
  @Transactional
  async cloneInstoreProduct(shopId: number, productId: number, transaction?: Transaction) {
    const product = await this.services.productService.getOneById(productId);

    const createdProduct = await this.services.productService.cloneInStoreProduct(shopId, product, transaction);

    return {
      nameId: createdProduct.nameId
    };
  }

  @LogMethodSignature(log)
  @Transactional
  async cloneInstoreFromOnlineProduct(shopId: number, products: IProductDao[], transaction?: Transaction) {
    const createdProducts = await this.services.productService.cloneInstoreFromOnlineProduct(shopId, products, transaction);

    return {
      nameIds: createdProducts.map(p => p.nameId)
    };
  }

  @LogMethodSignature(log)
  @Transactional
  async countOnlineProduct(userId: number, transaction?: Transaction): Promise<ICountProductsByStatus> {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }
    const result = await this.services.productService.countOnlineProduct(userId, transaction);

    return result;
  }

  @LogMethodSignature(log)
  @Transactional
  async delete(productId: number, transaction?: Transaction): Promise<boolean> {
    if (!productId) {
      throw ApiError.badRequest('Parameter "productId" should not be empty');
    }

    try {
      await this.services.productService.deleteById(productId, transaction);
    } catch (err) {
      throw ApiError.internal(err.message);
    }

    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async updateOnlineProduct(productId: number, oldHasParameters: boolean, updateObject: IUpdateProductModel, transaction?: Transaction) {
    if (!productId) {
      throw new Error('Parameter "productId" should not be empty');
    }
    if (!updateObject) {
      throw new Error('Parameter "updateObject" should not be empty');
    }

    const rarenessTotalPoint = await this.services.rarenessLevelService.calcRarenessTotalPoint(
      updateObject.transparency?.highlightPoints,
      updateObject.transparency?.rarenessLevel
    );
    const updated = await this.services.productService.updateById(
      productId,
      {
        ...updateObject,
        rarenessTotalPoint
      },
      transaction
    );

    const updateProductDetails = [];

    updateProductDetails.push(
      this.services.inventoryService.updateByProductId(productId, updateObject.stock, null, transaction),
      this.services.productCategoryService.updateByProductId(productId, updateObject.categoryId, transaction)
    );

    if (updateObject.colors) {
      updateProductDetails.push(this.services.productColorService.updateByProductId(productId, updateObject.colors, transaction));
    }

    if (updateObject.patterns) {
      updateProductDetails.push(this.services.productPatternService.updateByProductId(productId, updateObject.patterns, transaction));
    }

    if (updateObject.customParameters) {
      updateProductDetails.push(
        this.services.productCustomParameterService.updateByProductId(productId, updateObject.customParameters, transaction)
      );
    }

    if (updateObject.hasParameters && !oldHasParameters) {
      const parameterSets = await this.services.productParameterSetService.getAllByProductId(productId);
      updateProductDetails.push(
        this.services.productParameterSetService.updateMainStock(productId, parameterSets, SalesMethodEnum.ONLINE, transaction)
      );
    }

    if (updateObject.images) {
      updateProductDetails.push(this.services.productImageService.updateByProductId(productId, updateObject.images, transaction));
    }

    if (updateObject.story) {
      updateProductDetails.push(this.services.productStoryService.updateByProductId(productId, updateObject.story, transaction));
    }

    if (updateObject.content) {
      updateProductDetails.push(this.services.productContentService.updateByProductId(productId, updateObject.content, transaction));
    }

    // Update product shipment prefecture
    updateProductDetails.push(
      this.services.productRegionalShippingFeesService.updateByProductId(productId, updateObject.regionalShippingFees, transaction)
    );

    if (updateObject.shippingFees) {
      updateProductDetails.push(
        this.services.productShippingFeesService.updateByProductId(productId, updateObject.shippingFees, transaction)
      );
    }

    await Promise.all(updateProductDetails);

    await this.services.auditProductService.auditProduct(
      AuditTypes.EDIT,
      {
        id: productId,
        stock: updateObject.stock,
        hasParameters: updateObject.hasParameters
      },
      transaction
    );

    return updated;
  }

  @LogMethodSignature(log)
  @Transactional
  async outOfStock(userId: number, product: IProductModel, transaction?: Transaction): Promise<boolean> {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }
    if (!product) {
      throw new Error('Parameter "product" should not be empty');
    }

    await Promise.all([
      this.services.productService.publishById(product.id, transaction),
      this.services.inventoryService.setOutOfStock(product.id, product.salesMethod, transaction)
    ]);

    if (product.salesMethod === SalesMethodEnum.ONLINE) {
      await this.services.auditProductService.auditProduct(AuditTypes.OUT_OF_STOCK, { id: product.id }, transaction);
    }

    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async publish(userId: number, product: IProductModel, transaction?: Transaction): Promise<boolean> {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }
    if (!product) {
      throw new Error('Parameter "product" should not be empty');
    }

    await this.services.productService.publishById(product.id, transaction);

    if (product.salesMethod === SalesMethodEnum.ONLINE) {
      await this.services.auditProductService.auditProduct(AuditTypes.PUBLISH, { id: product.id }, transaction);
    }

    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async unpublish(userId: number, product: IProductModel, transaction?: Transaction): Promise<boolean> {
    if (!userId) {
      throw new Error('Parameter "userId" should not be empty');
    }
    if (!product) {
      throw new Error('Parameter "product" should not be empty');
    }

    await this.services.productService.unpublishById(product.id, transaction);
    if (product.salesMethod === SalesMethodEnum.ONLINE) {
      await this.services.auditProductService.auditProduct(AuditTypes.UNPUBLISH, { id: product.id }, transaction);
    }
    return true;
  }

  @LogMethodSignature(log)
  async getColorParameters(productId: number): Promise<IProductColorModel[]> {
    if (!productId) {
      throw new Error('Parameter "productId" should not be empty');
    }

    const result = await this.services.productColorService.getColorParametersByProductId(productId);

    return result;
  }

  @LogMethodSignature(log)
  @Transactional
  async updateColorParameters(
    productId: number,
    colorParameters: IProductColorModel[],
    transaction?: Transaction
  ): Promise<Partial<IProductColorModel[]>> {
    if (!productId) {
      throw new Error('Parameter "productId" should not be empty');
    }

    await this.services.productColorService.updateByProductId(productId, colorParameters, transaction);

    const result = this.services.productColorService.getColorParametersByProductId(productId, transaction);

    return result;
  }

  @LogMethodSignature(log)
  async getCustomParameters(productId: number): Promise<IProductCustomParameterModel[]> {
    if (!productId) {
      throw new Error('Parameter "productId" should not be empty');
    }

    const result = await this.services.productCustomParameterService.getCustomParametersByProductId(productId);

    return result;
  }

  @LogMethodSignature(log)
  @Transactional
  async updateCustomParameters(
    productId: number,
    customParameters: IProductCustomParameterModel[],
    transaction?: Transaction
  ): Promise<Partial<IProductCustomParameterModel[]>> {
    if (!productId) {
      throw new Error('Parameter "productId" should not be empty');
    }

    await this.services.productCustomParameterService.updateByProductId(productId, customParameters, transaction);

    const result = await this.services.productCustomParameterService.getCustomParametersByProductId(productId, transaction);

    return result;
  }

  // @LogMethodSignature(log)
  async searchOnlineProduct(searchQuery: ISearchQuery, userId?: number): Promise<IProductsListSearch> {
    const result = await this.services.productService.searchProduct(searchQuery, SalesMethodEnum.ONLINE);
    await this.services.inventoryService.loadMainProductStockQuantity(result.rows, userId);

    return result;
  }

  @LogMethodSignature(log)
  @Transactional
  async updateParameterSets(
    productId: number,
    parameterSets: Partial<IUpdateProductParameterSetModel>[],
    transaction?: Transaction
  ): Promise<boolean> {
    const product = await this.services.productService.getOne({
      where: { id: productId },
      attributes: ['id', 'hasParameters', 'salesMethod']
    });
    const result = await this.services.productParameterSetService.save(
      productId,
      product.salesMethod,
      parameterSets,
      product.hasParameters,
      transaction
    );
    await this.services.auditProductService.auditProductParameterSets(productId, parameterSets, transaction);
    return result;
  }

  @LogMethodSignature(log)
  async getParameterSets(productId: number): Promise<IProductParameterSetDao[]> {
    const result = await this.services.productParameterSetService.getAllByProductId(productId);
    return result;
  }

  @LogMethodSignature(log)
  @Transactional
  async updateDisplayPosition(userId: number, products: IProductDisplayPositionModel[], transaction?: Transaction): Promise<boolean> {
    if (!userId) {
      throw ApiError.badRequest('Parameter "userId" should not be empty');
    }
    if (products && products.length > 0) {
      await this.services.productService.updatePositionByProductNameId(userId, products, transaction);
    }

    return true;
  }

  @LogMethodSignature(log)
  @Transactional
  async updateInstoreProduct(productId: number, oldHasParameters: boolean, updateObject: IUpdateProductModel, transaction?: Transaction) {
    if (!productId) {
      throw new Error('Parameter "productId" should not be empty');
    }
    if (!updateObject) {
      throw new Error('Parameter "updateObject" should not be empty');
    }

    const updated = await this.services.productService.updateById(
      productId,
      {
        ...updateObject
      },
      transaction
    );

    const updateInstoreProductDetails = [];

    updateInstoreProductDetails.push(
      this.services.inventoryService.updateByProductId(productId, updateObject.stock, updateObject.shipLaterStock, transaction)
    );

    if (updateObject.colors) {
      updateInstoreProductDetails.push(this.services.productColorService.updateByProductId(productId, updateObject.colors, transaction));
    }

    if (updateObject.customParameters) {
      updateInstoreProductDetails.push(
        this.services.productCustomParameterService.updateByProductId(productId, updateObject.customParameters, transaction)
      );
    }

    if (updateObject.hasParameters && !oldHasParameters) {
      const parameterSets = await this.services.productParameterSetService.getAllByProductId(productId);
      updateInstoreProductDetails.push(
        this.services.productParameterSetService.updateMainStock(productId, parameterSets, SalesMethodEnum.INSTORE, transaction)
      );
    }

    if (updateObject.images) {
      updateInstoreProductDetails.push(this.services.productImageService.updateByProductId(productId, updateObject.images, transaction));
    }

    if (updateObject.content) {
      updateInstoreProductDetails.push(this.services.productContentService.updateByProductId(productId, updateObject.content, transaction));
    }

    // Update product shipment prefecture
    updateInstoreProductDetails.push(
      this.services.productRegionalShippingFeesService.updateByProductId(productId, updateObject.regionalShippingFees, transaction)
    );

    if (updateObject.shippingFees) {
      updateInstoreProductDetails.push(
        this.services.productShippingFeesService.updateByProductId(productId, updateObject.shippingFees, transaction)
      );
    }

    await Promise.all(updateInstoreProductDetails);

    return updated;
  }
}

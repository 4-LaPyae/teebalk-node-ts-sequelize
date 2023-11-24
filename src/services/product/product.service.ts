import { randomBytes } from 'crypto';

import { ApiError } from '@freewilltokyo/freewill-be';
import _ from 'lodash';
import { col, FindOptions, fn, Includeable, Op, Sequelize, Transaction } from 'sequelize';

import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_TOP_PRODUCTS_LIST_LATEST_LIMIT,
  DEFAULT_TOP_PRODUCTS_LIST_LIMIT,
  LanguageEnum,
  TopProductTypeEnum
} from '../../constants';
import {
  ICountProductsByStatus,
  ICreateProductModel,
  IProductPaginationOptions,
  IProductsList,
  IProductsListSearch,
  IProductSortQuery,
  IProductTransparencyTransferModel,
  ISearchQuery,
  IUpdateProductModel
} from '../../controllers/product/interfaces';
import {
  ICommercialProductRepository,
  IConfigRepository,
  IEthicalityLevelRepository,
  IFindAndCountResult,
  IHighlightPointRepository,
  IProductDao,
  IProductDisplayPositionModel,
  IProductHighlightPointRepository,
  IProductLocationRepository,
  IProductMaterialRepository,
  IProductNearbyModel,
  IProductProducerRepository,
  IProductRepository,
  IProductTransparencyRepository,
  IShopDao,
  IShopRepository,
  ITopProductRepository,
  ITopProductV2Repository
} from '../../dal';
import { ORDER, PRODUCT_CLONING_MODELS, PRODUCT_FIELDS, PRODUCT_RELATED_MODELS } from '../../dal/product/constants';
import { ITopProductDao } from '../../dal/top-product/interfaces';
import {
  CategoryDbModel,
  DataBaseTableNames,
  EthicalityLevelFieldEnum,
  GeometryTypeEnum,
  HighlightTypeEnum,
  IGeometry,
  IProductContentModel,
  IProductHighlightPointModel,
  IProductImageModel,
  IProductLocationModel,
  IProductMaterialModel,
  IProductModel,
  IProductProducerModel,
  IProductStoryModel,
  IProductTransparencyModel,
  ProductContentDbModel,
  ProductImageDbModel,
  ProductParameterSetDbModel,
  ProductRegionalShippingFeesDbModel,
  ProductShippingFeesDbModel,
  ProductStatusEnum,
  ProductStoryDbModel,
  SalesMethodEnum
} from '../../database';
import {
  calculateProductAmount,
  getPaginationMetaData,
  ICalculateProductAmountParam,
  ICalculateProductTransparencyLevel,
  IPaginationInfoParams,
  selectWithLanguage
} from '../../helpers';
import { cloneProductTitle, zeroPaddingID } from '../../helpers';
import { IShop, ShopService } from '../shop';

import { IProductTransparencyFields, PRODUCT_TRANSPARENCY_FIELDS } from './constants';

import {
  ProductColorService,
  ProductContentService,
  ProductCustomParameterService,
  ProductImageService,
  ProductParameterSetService,
  ProductRegionalShippingFeesService,
  ProductShippingFeesService
} from '..';

const {
  contentsClone,
  imagesClone,
  colorsClone,
  customParametersClone,
  shippingFeesClone,
  regionalShippingFeesClone,
  parameterSetsClone
} = PRODUCT_CLONING_MODELS;

export interface IProduct extends IProductDao {
  shop: IShop;
  content: IProductContentModel;
  story?: IProductStoryModel;
  quantity?: number;
  priceWithTax?: number;
  totalPrice?: number;
  totalPriceWithTax?: number;
  cashbackCoin?: number;
  totalCashbackCoin?: number;
  amount?: number;
}

export interface ProductServiceOptions {
  shopRepository: IShopRepository;
  shopService: ShopService;
  productRepository: IProductRepository;
  configRepository: IConfigRepository;
  highlightPointRepository: IHighlightPointRepository;
  ethicalityLevelRepository: IEthicalityLevelRepository;
  productHighlightPointRepository: IProductHighlightPointRepository;
  productLocationRepository: IProductLocationRepository;
  productProducerRepository: IProductProducerRepository;
  productTransparencyRepository: IProductTransparencyRepository;
  productMaterialRepository: IProductMaterialRepository;
  topProductRepository: ITopProductRepository;
  topProductV2Repository: ITopProductV2Repository;
  commercialProductRepository: ICommercialProductRepository;
  productShippingFeesService: ProductShippingFeesService;
  productParameterSetService: ProductParameterSetService;
  productRegionalShippingFeesService: ProductRegionalShippingFeesService;
  productContentService: ProductContentService;
  productImageService: ProductImageService;
  productColorService: ProductColorService;
  productCustomParameterService: ProductCustomParameterService;
}

export class ProductService {
  private readonly DEFAULT_NAME_ID_LENGTH: number = 30;
  private readonly DEFAULT_ID_LENGTH: number = 4;
  private services: ProductServiceOptions;

  constructor(services: ProductServiceOptions) {
    this.services = services;
  }

  async create(userId: number, shopId: number, product: ICreateProductModel, transaction?: Transaction): Promise<IProductDao> {
    const { ethicalityLevel, transparencyLevel } = product.transparency
      ? await this.getTransparencyLevels(product.transparency)
      : { ethicalityLevel: 0, transparencyLevel: 0 };

    const createdProduct = await this.services.productRepository.createProduct(
      {
        ...product,
        userId,
        shopId,
        coordinate: this.convertProductCoordinateType(product.coordinate),
        sdgs: product?.transparency?.sdgs ? JSON.stringify(product.transparency.sdgs) : '[]',
        ethicalLevel: ethicalityLevel,
        transparencyLevel,
        recycledMaterialPercent: product.transparency?.recycledMaterialPercent,
        materialNaturePercent: product.transparency?.materialNaturePercent,
        rarenessLevel: product.transparency?.rarenessLevel
      },
      { transaction }
    );

    if (product.transparency) {
      this.createProductTransparency(createdProduct.id, product.transparency, product.language, transaction);
    }

    return createdProduct;
  }

  async clone(product: IProductDao, nameId: string, transaction?: Transaction): Promise<IProductDao> {
    const createdProduct = await this.services.productRepository.create(
      {
        ...product,
        nameId,
        status: ProductStatusEnum.DRAFT
      },
      { transaction }
    );

    if (product.transparencies) {
      product.transparencies.forEach(async transparency => {
        await this.updateProductTransparency(createdProduct.id, transparency, transparency.language, transaction);
      });

      if (product.producers) {
        await this.createProductProducers(createdProduct.id, product.producers, transaction);
      }

      if (product.locations) {
        product.locations.forEach(async location => {
          await this.updateProductLocation(createdProduct.id, location, transaction);
        });
      }

      if (product.materials) {
        await this.createMaterials(createdProduct.id, product.materials, transaction);
      }

      if (product.highlightPoints) {
        await this.createProductHighlightPoints(
          createdProduct.id,
          product.highlightPoints.map(item => item.id),
          transaction
        );
      }
    }

    return createdProduct;
  }

  async cloneInStoreProduct(shopId: number, product: IProductDao, transaction?: Transaction): Promise<IProductDao> {
    if (product.salesMethod === SalesMethodEnum.INSTORE && product.displayPosition) {
      await this.services.productRepository.increaseDisplayPosition({
        where: {
          shopId: product.shopId,
          salesMethod: SalesMethodEnum.INSTORE,
          displayPosition: {
            [Op.gt]: product.displayPosition
          }
        }
      });

      product.displayPosition = (product.displayPosition ?? 0) + 1;
    }

    delete product.id;

    const createdProduct = await this.services.productRepository.create(
      {
        ...product,
        nameId: this.generateNameId(),
        salesMethod: SalesMethodEnum.INSTORE,
        status: ProductStatusEnum.DRAFT
      },
      { transaction }
    );

    await this.updateInstoreProductCode(shopId, createdProduct.id, transaction);

    const createProductDetails: Promise<any>[] = [];

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

    return createdProduct;
  }

  async cloneInstoreFromOnlineProduct(shopId: number, products: IProductDao[], transaction?: Transaction): Promise<IProductDao[]> {
    const createProductResult: Promise<IProductDao>[] = [];

    products.forEach(product => {
      product.stock = 0;
      product.shipLaterStock = 0;

      if (product.images && product.images.length) {
        product.images = [product.images[0]];
      }

      if (product.parameterSets && product.parameterSets.length) {
        product.parameterSets.forEach(p => {
          p.stock = 0;
          p.shipLaterStock = 0;
        });
      }

      createProductResult.push(this.cloneInStoreProduct(shopId, product, transaction));
    });

    const createdProducts = await Promise.all(createProductResult);

    await this.services.productRepository.bulkUpdatePositionFromId(
      createdProducts.map(p => p.id),
      { transaction }
    );

    return createdProducts;
  }

  async createProductTransparency(
    productId: number,
    transparency: IProductTransparencyTransferModel,
    language?: LanguageEnum,
    transaction?: Transaction
  ) {
    await this.updateProductTransparency(productId, transparency, language, transaction);

    if (transparency.producers) {
      await this.createProductProducers(productId, transparency.producers, transaction);
    }

    if (transparency.location) {
      await this.updateProductLocation(productId, transparency.location, transaction);
    }

    if (transparency.materials) {
      await this.createMaterials(productId, transparency.materials, transaction);
    }

    if (transparency.highlightPoints) {
      await this.createProductHighlightPoints(productId, transparency.highlightPoints, transaction);
    }
  }

  async createProductHighlightPoints(
    productId: number,
    highlightPointIds: number[],
    transaction?: Transaction
  ): Promise<IProductHighlightPointModel[]> {
    const createdProductHighlightPoints = await this.services.productHighlightPointRepository.bulkCreate(
      highlightPointIds.map(item => {
        return {
          productId,
          highlightPointId: item
        };
      }),
      { transaction }
    );

    return createdProductHighlightPoints;
  }

  async updateProductTransparency(
    productId: number,
    transparency: IProductTransparencyTransferModel,
    language?: LanguageEnum,
    transaction?: Transaction
  ): Promise<void> {
    const productTransparency = {
      ...this.transformToProductTransparency(transparency),
      productId
    };

    if (productTransparency.id && productTransparency.id > 0) {
      await this.services.productTransparencyRepository.update(productTransparency, {
        where: {
          id: productTransparency.id
        },
        transaction
      });
    } else {
      await this.services.productTransparencyRepository.create(
        {
          ...productTransparency,
          language
        },
        { transaction }
      );
    }
  }

  async createProductProducers(
    productId: number,
    producers: IProductProducerModel[],
    transaction?: Transaction
  ): Promise<IProductProducerModel> {
    const createdProductProducers = await this.services.productProducerRepository.bulkCreate(
      producers.map(item => {
        return {
          ...item,
          productId,
          language: item.language ? item.language : LanguageEnum.ENGLISH
        };
      }),
      { transaction }
    );

    return createdProductProducers;
  }

  async updateProductHighlightPoints(productId: number, highlightPointIds: number[], transaction?: Transaction): Promise<void> {
    await this.services.productHighlightPointRepository.delete({
      where: {
        highlightPointId: {
          [Op.notIn]: highlightPointIds
        },
        productId
      },
      transaction
    });

    const productHighlightPoints = await this.services.productHighlightPointRepository.findAll({
      where: {
        productId,
        deletedAt: null
      },
      attributes: ['highlightPointId']
    });

    const existedHighlightPointIds: number[] = productHighlightPoints.map(item => item.highlightPointId);

    const newHighLightPointIds = highlightPointIds.filter(item => !existedHighlightPointIds.includes(item));
    await this.createProductHighlightPoints(productId, newHighLightPointIds, transaction);
  }

  async updateProductProducers(productId: number, productProducers: IProductProducerModel[], transaction?: Transaction) {
    if (!productProducers.length) {
      await this.services.productProducerRepository.delete({
        where: {
          productId
        }
      });
      return;
    }
    const productProducerIds = productProducers.map(item => (item.id ? item.id : 0));
    await this.services.productProducerRepository.delete({
      where: {
        id: {
          [Op.notIn]: productProducerIds
        },
        productId,
        language: productProducers.length && productProducers[0].language ? productProducers[0].language : ''
      }
    });

    const producers: IProductProducerModel[] = [];
    productProducers.map(item => {
      if (item.id) {
        return this.services.productProducerRepository.update(item, {
          where: {
            id: item.id
          },
          transaction
        });
      }
      producers.push(item);
    });

    await this.createProductProducers(productId, producers, transaction);
  }

  generateNameId(length: number = this.DEFAULT_NAME_ID_LENGTH): string {
    return randomBytes(length + 2)
      .toString('base64')
      .replace(/\W/g, '')
      .substring(0, length);
  }

  async updateById(productId: number, product: IUpdateProductModel, transaction?: Transaction): Promise<Partial<IProductDao>> {
    const { ethicalityLevel, transparencyLevel } = product.transparency
      ? await this.getTransparencyLevels(product.transparency)
      : { ethicalityLevel: 0, transparencyLevel: 0 };
    const productCoordinate = this.convertProductCoordinateType(product.coordinate);

    const updateProductData: any = {
      ...product,
      coordinate: productCoordinate ? productCoordinate : null,
      ethicalLevel: ethicalityLevel,
      transparencyLevel,
      recycledMaterialPercent: product.transparency?.recycledMaterialPercent,
      materialNaturePercent: product.transparency?.materialNaturePercent,
      rarenessLevel: product.transparency?.rarenessLevel
    };
    updateProductData.sdgs = product?.transparency?.sdgs ? JSON.stringify(updateProductData.transparency.sdgs) : '[]';

    const updatedProduct = await this.services.productRepository.update(updateProductData, {
      where: { id: productId },
      transaction
    });

    if (product.transparency) {
      await this.updateProductTransparency(productId, product.transparency, product.language, transaction);

      if (product.transparency.location) {
        await this.updateProductLocation(productId, product.transparency.location, transaction);
      }

      if (product.transparency.materials) {
        await this.updateMaterials(productId, product.transparency.materials, transaction);
      }

      if (product.transparency.producers) {
        await this.updateProductProducers(productId, product.transparency.producers, transaction);
      }

      if (product.transparency.highlightPoints) {
        await this.updateProductHighlightPoints(productId, product.transparency.highlightPoints, transaction);
      }
    }

    return updatedProduct;
  }

  async getProductsNearByGeolocation(lng: number, lat: number, language?: LanguageEnum): Promise<IProductNearbyModel[]> {
    const products: IProductDao[] = await this.services.productRepository.getByGeolocationDistance(lng, lat);
    const [taxPercents, coinRewardPercents] = await Promise.all([
      this.services.configRepository.getTaxPercents(),
      this.services.configRepository.getCoinRewardPercents()
    ]);

    return products.map(product => {
      product.price = product.price ? product.price : 0;
      const priceWithTax = Math.round(product.price + (product.price * taxPercents) / 100);
      const cashbackCoin = Math.floor((priceWithTax * coinRewardPercents) / 100);
      const productContent: any = selectWithLanguage(product?.contents, language, false);
      const productImages: any = selectWithLanguage(product?.images, language, false);
      const productLocation: any = selectWithLanguage(product?.locations, language, false);

      const result = {
        ...product,
        cashbackCoin,
        content: productContent,
        images: _.isEmpty(productImages) ? [] : [productImages],
        priceWithTax,
        transparency: {
          location: productLocation
        }
      };

      delete result.price;
      delete result.contents;
      delete result.locations;
      return result;
    });
  }

  async getTopList(type: TopProductTypeEnum, options: IProductPaginationOptions): Promise<ITopProductDao[]> {
    const { language } = options || {};
    let products = [];

    switch (type) {
      case TopProductTypeEnum.TOP_PRODUCT: {
        products = await this.services.topProductRepository.getTopList();
        products = products.sort(() => Math.random() - 0.5);
        break;
      }

      case TopProductTypeEnum.TOP_LATEST: {
        const paginationOptions = {
          pageNumber: 1,
          limit: DEFAULT_TOP_PRODUCTS_LIST_LATEST_LIMIT
        };

        const { contents, images, highlightPoints, category } = PRODUCT_RELATED_MODELS;

        const tmpProducts = await this.services.productRepository.getList(paginationOptions, {
          attributes: [[fn('MAX', col('id')), 'id']],
          where: { status: ProductStatusEnum.PUBLISHED, salesMethod: SalesMethodEnum.ONLINE },
          group: ['shop_id'],
          order: [[fn('MAX', col('id')), 'DESC']]
        });

        const tmpProductIds = tmpProducts.map(data => data.id);

        products = await this.services.productRepository.getList(paginationOptions, {
          where: {
            id: tmpProductIds
          },
          include: [images, contents, highlightPoints, category],
          attributes: ['id', 'nameId', 'shopId', 'price', 'stock', 'publishedAt', 'createdAt'],
          order: [
            [PRODUCT_FIELDS.CREATED_AT, ORDER.DESC],
            [PRODUCT_FIELDS.PUBLISHED_AT, ORDER.DESC]
          ]
        });

        break;
      }

      case TopProductTypeEnum.MOFF_2022: {
        const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER } = options || {};
        const offset = (pageNumber - 1) * limit;
        products = await this.services.topProductV2Repository.getTopList(type, { limit, offset });
        break;
      }

      case TopProductTypeEnum.TOP_COMMERCIAL: {
        products = await this.services.commercialProductRepository.getCommercialList();
        break;
      }

      case TopProductTypeEnum.TOP_HIGHLIGHT: {
        if (!options.highlightPointsId) {
          throw ApiError.badRequest(`highlightPointsId is required for request type: ${TopProductTypeEnum.TOP_HIGHLIGHT}`);
        }

        const highlightPointsId = options.highlightPointsId;
        const paginationOptions = {
          pageNumber: 1,
          limit: DEFAULT_TOP_PRODUCTS_LIST_LIMIT
        };

        const { contents, images, highlightPoints, category } = PRODUCT_RELATED_MODELS;

        // get product ids
        const tmpProductQueryTryCount = 2;
        const tmpProductQueryPaginationOptions: IProductPaginationOptions = {
          pageNumber: 1,
          limit: 100 // only get 100 at a time
        };

        let queryProductIds: number[] = [];

        while (queryProductIds.length < paginationOptions.limit && tmpProductQueryPaginationOptions.pageNumber < tmpProductQueryTryCount) {
          const tmpProducts = await this.getProductIdsByHighlightPointsIdFromEachShop(tmpProductQueryPaginationOptions, highlightPointsId);

          queryProductIds = [...queryProductIds, ...tmpProducts];

          tmpProductQueryPaginationOptions.pageNumber += 1;
        }

        // get products
        products = await this.services.productRepository.getList(paginationOptions, {
          where: { status: ProductStatusEnum.PUBLISHED, salesMethod: SalesMethodEnum.ONLINE, id: queryProductIds },
          include: [images, contents, highlightPoints, category],
          attributes: ['id', 'nameId', 'price', 'stock', 'publishedAt', 'createdAt'],
          order: [
            [PRODUCT_FIELDS.CREATED_AT, ORDER.DESC],
            [PRODUCT_FIELDS.PUBLISHED_AT, ORDER.DESC]
          ]
        });

        break;
      }

      case TopProductTypeEnum.TOP_ETHICAL: {
        const paginationOptions = {
          pageNumber: 1,
          limit: DEFAULT_TOP_PRODUCTS_LIST_LIMIT
        };

        const { contents, images, highlightPoints, category } = PRODUCT_RELATED_MODELS;

        // get product ids
        const tmpProductQueryTryCount = 2;
        const tmpProductQueryPaginationOptions: IProductPaginationOptions = {
          pageNumber: 1,
          limit: 100
        };

        let queryProductIds: number[] = [];

        while (queryProductIds.length < paginationOptions.limit && tmpProductQueryPaginationOptions.pageNumber < tmpProductQueryTryCount) {
          const tmpProductIds = await this.getProductIdsOneFromEachShopByEthical(tmpProductQueryPaginationOptions);

          queryProductIds = [...queryProductIds, ...tmpProductIds];

          tmpProductQueryPaginationOptions.pageNumber += 1;
        }

        // get products
        products = await this.services.productRepository.getList(paginationOptions, {
          where: { id: queryProductIds },
          include: [images, contents, highlightPoints, category],
          attributes: ['id', 'nameId', 'price', 'stock', 'rarenessLevel', 'ethicalLevel', 'publishedAt', 'createdAt'],
          order: [
            [PRODUCT_FIELDS.ETHICAL_LEVEL, ORDER.DESC],
            [PRODUCT_FIELDS.RARENESS_LEVEL, ORDER.DESC],
            [PRODUCT_FIELDS.PUBLISHED_AT, ORDER.DESC]
          ]
        });

        break;
      }

      case TopProductTypeEnum.TOP_TRANSPARENCY: {
        const paginationOptions = {
          pageNumber: 1,
          limit: DEFAULT_TOP_PRODUCTS_LIST_LIMIT
        };

        const { contents, images, producers, highlightPoints, category } = PRODUCT_RELATED_MODELS;

        // get product ids
        const tmpProductQueryTryCount = 2;
        const tmpProductQueryPaginationOptions: IProductPaginationOptions = {
          pageNumber: 1,
          limit: 100
        };

        let queryProductIds: number[] = [];

        while (queryProductIds.length < paginationOptions.limit && tmpProductQueryPaginationOptions.pageNumber < tmpProductQueryTryCount) {
          const tmpProductIds = await this.getProductIdsOneFromEachShopByTransparency(tmpProductQueryPaginationOptions);

          queryProductIds = [...queryProductIds, ...tmpProductIds];

          tmpProductQueryPaginationOptions.pageNumber += 1;
        }

        // get products
        products = await this.services.productRepository.getList(paginationOptions, {
          where: { id: queryProductIds },
          include: [images, contents, highlightPoints, category, producers],
          attributes: ['id', 'nameId', 'price', 'stock', 'rarenessLevel', 'transparencyLevel', 'publishedAt', 'createdAt'],
          order: [
            [PRODUCT_FIELDS.TRANSPARENCY_LEVEL, ORDER.DESC],
            [PRODUCT_FIELDS.RARENESS_LEVEL, ORDER.DESC],
            [PRODUCT_FIELDS.PUBLISHED_AT, ORDER.DESC]
          ]
        });

        break;
      }
    }

    const [taxPercents, coinRewardPercents] = await Promise.all([
      this.services.configRepository.getTaxPercents(),
      this.services.configRepository.getCoinRewardPercents()
    ]);

    return products.map(item => {
      const product = item.product || item;
      const productContent: any = selectWithLanguage(product?.contents, language, false);
      const productImage: any = selectWithLanguage(product?.images, language, false);
      const productStory: any = selectWithLanguage(product?.stories, language, false);
      const productProducers: any = selectWithLanguage(product?.producers, language, false);
      const productHighlightPoints: number[] = product.highlightPoints ? product.highlightPoints.map(({ id }: { id: number }) => id) : [];
      const productCategoryId: number = product.categories && product.categories[0].id;

      product.price = product.price || 0;
      const priceWithTax = Math.round(product.price + (product.price * taxPercents) / 100);
      const cashbackCoin = Math.floor((priceWithTax * coinRewardPercents) / 100);

      const result = {
        ...product,
        priceWithTax,
        cashbackCoin,
        categoryId: productCategoryId,
        content: productContent,
        images: _.isEmpty(productImage) ? [] : [productImage],
        story: productStory,
        transparency: {
          producers: _.isEmpty(productProducers) ? [] : [productProducers],
          highlightPoints: productHighlightPoints || []
        }
      };

      delete result.stories;
      delete result.contents;
      delete result.producers;
      delete result.categories;
      delete result.highlightPoints;

      return result;
    });
  }

  async getAllProducts(
    shopId: number,
    salesMethod: SalesMethodEnum,
    optionsQuery: IProductSortQuery | IProductPaginationOptions
  ): Promise<IProductsList> {
    let products = await this.services.productRepository.getAllProducts(shopId, salesMethod, optionsQuery);
    const { limit = DEFAULT_LIMIT } = optionsQuery;
    let { pageNumber = DEFAULT_PAGE_NUMBER } = optionsQuery;
    let { count } = products;

    while (products.rows.length === 0 && count > 0) {
      pageNumber = Math.ceil(count / limit);
      const newSearchQuery = {
        ...optionsQuery,
        pageNumber
      };
      products = await this.services.productRepository.getAllProducts(shopId, salesMethod, newSearchQuery);
      count = products.count;
    }

    const paginationInfoParams: IPaginationInfoParams = {
      limit,
      pageNumber,
      count
    };

    const metadata = getPaginationMetaData(paginationInfoParams);
    let data: IProduct[];
    if (salesMethod === SalesMethodEnum.ONLINE) {
      data = await this.mappingProductResponse(products.rows, optionsQuery.language);
    } else {
      data = await this.mappingInstoreProductResponse(products.rows, optionsQuery.language);
    }

    return {
      count,
      metadata,
      rows: data
    };
  }

  async getList(
    userId: number,
    status: ProductStatusEnum[] = [ProductStatusEnum.PUBLISHED],
    salesMethod = SalesMethodEnum.ONLINE,
    options: IProductPaginationOptions
  ): Promise<IProductsList> {
    const { limit = DEFAULT_LIMIT } = options;
    let { pageNumber = DEFAULT_PAGE_NUMBER } = options;
    const { shop, contents, stories, images, materials, colors, patterns, customParameters, categories } = PRODUCT_RELATED_MODELS;

    const findOptions = {
      order: [['updatedAt', 'DESC'], status.includes(ProductStatusEnum.PUBLISHED) ? ['publishedAt', 'DESC'] : ['createdAt', 'DESC']],
      where: {
        status,
        userId,
        salesMethod
      },
      include: [shop, contents, stories, images, materials, colors, patterns, customParameters, categories]
    } as FindOptions;

    let [products, totalCount] = await Promise.all([
      this.services.productRepository.getList(options, findOptions),
      this.services.productRepository.count(findOptions)
    ]);

    while (products.length === 0 && totalCount > 0) {
      pageNumber = Math.ceil(totalCount / limit);
      const newOptions = {
        ...options,
        pageNumber
      };

      [products, totalCount] = await Promise.all([
        this.services.productRepository.getList(newOptions, findOptions),
        this.services.productRepository.count(findOptions)
      ]);
    }

    const paginationInfoParams: IPaginationInfoParams = {
      limit,
      pageNumber,
      count: totalCount
    };

    const metadata = getPaginationMetaData(paginationInfoParams);

    return {
      count: totalCount,
      metadata,
      rows: await this.mappingProductResponse(products, options?.language)
    };
  }

  async searchProduct(searchQuery: ISearchQuery, salesMethod = SalesMethodEnum.ONLINE): Promise<IProductsListSearch> {
    let products = await this.services.productRepository.getProducts(searchQuery, salesMethod);
    const { limit = DEFAULT_LIMIT } = searchQuery;
    let { pageNumber = DEFAULT_PAGE_NUMBER } = searchQuery;
    let { count } = products;

    while (products.rows.length === 0 && count > 0) {
      pageNumber = Math.ceil(count / limit);
      const newSearchQuery = {
        ...searchQuery,
        pageNumber
      };
      products = await this.services.productRepository.getProducts(newSearchQuery, salesMethod);
      count = products.count;
    }

    const paginationInfoParams: IPaginationInfoParams = {
      limit,
      pageNumber,
      count
    };

    const metadata = getPaginationMetaData(paginationInfoParams);

    return {
      count,
      metadata,
      rows: await this.mappingProductResponse(products.rows, searchQuery.language)
    };
  }

  async getLowStockNotificationProducts(): Promise<IProductDao[]> {
    const { shop, contents } = PRODUCT_RELATED_MODELS;

    const lowStockProductNotificationQuery = `(SELECT product_id
      FROM ${DataBaseTableNames.LOW_STOCK_PRODUCT_NOTIFICATIONS}
      WHERE notified_at Is NULL)`;

    const findOptions = {
      where: {
        id: {
          [Op.in]: Sequelize.literal(lowStockProductNotificationQuery)
        }
      },
      include: [shop, contents]
    } as FindOptions;

    const products = await this.services.productRepository.findAll(findOptions);

    return products;
  }

  async getPublishedOnlineProductListByShopId(shopId: number, options?: IProductPaginationOptions): Promise<IProductsList> {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER, language } = options || {};
    const offset = (pageNumber - 1) * limit;
    const products = await this.services.productRepository.getPublishedOnlineProductListByShopId(shopId, { limit, offset });

    const paginationInfoParams: IPaginationInfoParams = {
      limit,
      pageNumber,
      count: products.count
    };

    const metadata = getPaginationMetaData(paginationInfoParams);

    return {
      count: products.count,
      metadata,
      rows: await this.mappingProductResponse(products.rows, language)
    };
  }

  async getPublishedInstoreProductsByShop(shopId: number, options: FindOptions, isShopMaster: boolean): Promise<IProductDao[]> {
    const products = await this.services.productRepository.findAll({
      ...options,
      where: {
        ...options.where,
        [Op.and]: [isShopMaster ? {} : { shopId }, { salesMethod: SalesMethodEnum.INSTORE }, { status: ProductStatusEnum.PUBLISHED }]
      },
      include: [
        ...(options.include ? (options.include as Includeable[]) : []),
        {
          as: 'contents',
          model: ProductContentDbModel,
          attributes: ['title', 'description']
        },
        {
          as: 'images',
          model: ProductImageDbModel,
          attributes: ['id', 'imagePath', 'imageDescription']
        },
        {
          as: 'parameterSets',
          model: ProductParameterSetDbModel,
          attributes: ['id', 'productId', 'colorId', 'customParameterId', 'price', 'stock', 'shipLaterStock', 'purchasedNumber', 'enable']
        }
      ],
      order: [
        [PRODUCT_FIELDS.DISPLAY_POSITION, ORDER.DESC],
        [PRODUCT_FIELDS.PRODUCT_ID, ORDER.DESC]
      ]
    });

    return products;
  }

  async getPublishedInstoreProductsByShopId(
    shopId: number,
    options: FindOptions,
    isShopMaster: boolean
  ): Promise<IFindAndCountResult<IProductDao>> {
    const result = await this.services.productRepository.findAndCountAll({
      ...options,
      where: {
        ...options.where,
        [Op.and]: [isShopMaster ? {} : { shopId }, { salesMethod: SalesMethodEnum.INSTORE }, { status: ProductStatusEnum.PUBLISHED }]
      },
      include: [
        ...(options.include ? (options.include as Includeable[]) : []),
        {
          as: 'contents',
          model: ProductContentDbModel,
          attributes: ['title', 'description'],
          separate: true
        },
        {
          as: 'images',
          model: ProductImageDbModel,
          attributes: ['id', 'imagePath', 'imageDescription'],
          separate: true
        },
        {
          as: 'parameterSets',
          model: ProductParameterSetDbModel,
          attributes: ['id', 'productId', 'colorId', 'customParameterId', 'price', 'stock', 'shipLaterStock', 'purchasedNumber', 'enable'],
          separate: true
        }
      ],
      order: [
        [PRODUCT_FIELDS.DISPLAY_POSITION, ORDER.DESC],
        [PRODUCT_FIELDS.PRODUCT_ID, ORDER.DESC]
      ],
      distinct: true,
      subQuery: false
    } as FindOptions);

    return result;
  }

  async getAllPublishedInstoreProductsByShopId(
    shopId: number,
    optionsQuery: ISearchQuery,
    isShopMaster: boolean
  ): Promise<IProductsListSearch> {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER, searchText } = optionsQuery;
    const offset = (pageNumber - 1) * limit;

    const options: FindOptions = {
      attributes: ['id', 'userId', 'nameId', 'code', 'status', 'price', 'stock', 'shipLaterStock', 'hasParameters'],
      limit,
      offset
    };

    if (searchText) {
      const productContentQuery = `(SELECT product_id FROM ${
        ProductContentDbModel.tableName
      } where title like ${this.services.productRepository.escape(`%${searchText}%`)})`;

      options.where = {
        [Op.or]: [{ id: { [Op.in]: Sequelize.literal(productContentQuery) } }, { code: { [Op.like]: `%${searchText}%` } }]
      };
    }

    const result = await this.getPublishedInstoreProductsByShopId(shopId, options, isShopMaster);
    const { count, rows } = result;
    const metadata = getPaginationMetaData({ limit, pageNumber, count });

    return {
      count,
      metadata,
      rows: rows as IProduct[]
    };
  }

  async getAllOnlineProducts(options: FindOptions): Promise<IProductDao[]> {
    options.where = {
      ...options.where,
      salesMethod: SalesMethodEnum.ONLINE
    };

    const products = await this.getAll(options);
    return products;
  }

  async getAll(options: FindOptions): Promise<IProductDao[]> {
    const products = await this.services.productRepository.findAll({
      ...options,
      where: {
        ...options.where,
        deletedAt: null
      },
      include: [
        ...(options.include ? (options.include as Includeable[]) : []),
        {
          as: 'contents',
          separate: true,
          model: ProductContentDbModel,
          attributes: ['title', 'description']
        },
        {
          as: 'categories',
          model: CategoryDbModel,
          through: {
            attributes: ['productId', 'categoryId']
          },
          attributes: ['id']
        },
        {
          as: 'stories',
          separate: true,
          model: ProductStoryDbModel,
          attributes: ['id']
        },
        {
          as: 'images',
          separate: true,
          model: ProductImageDbModel,
          attributes: ['id']
        },
        {
          as: 'parameterSets',
          separate: true,
          model: ProductParameterSetDbModel,
          attributes: ['id', 'productId', 'colorId', 'customParameterId', 'price', 'stock', 'purchasedNumber', 'enable']
        },
        {
          as: 'shippingFees',
          model: ProductShippingFeesDbModel,
          separate: true,
          attributes: ['quantityFrom', 'quantityTo', 'shippingFee', 'overseasShippingFee'],
          include: [
            {
              as: 'regionalShippingFees',
              model: ProductRegionalShippingFeesDbModel,
              separate: true,
              attributes: ['prefectureCode', 'shippingFee']
            }
          ]
        }
      ]
    });
    return products;
  }

  async getOneOnlineProduct(options: FindOptions): Promise<IProductDao> {
    options.where = {
      ...options.where,
      salesMethod: SalesMethodEnum.ONLINE
    };

    const product = await this.getOne(options);
    return product;
  }

  async getOneInstoreProduct(options: FindOptions): Promise<IProductDao> {
    options.where = {
      ...options.where,
      salesMethod: SalesMethodEnum.INSTORE
    };

    const product = await this.getOne(options);
    return product;
  }

  async getOne(options: FindOptions): Promise<IProductDao> {
    const product = await this.services.productRepository.findOne({
      ...options,
      where: {
        ...options.where,
        deletedAt: null
      },
      include: [
        ...(options.include ? (options.include as Includeable[]) : []),
        {
          as: 'contents',
          separate: true,
          model: ProductContentDbModel,
          attributes: ['title', 'description']
        },
        {
          as: 'categories',
          model: CategoryDbModel,
          through: {
            attributes: ['productId', 'categoryId']
          },
          attributes: ['id']
        },
        {
          as: 'stories',
          separate: true,
          model: ProductStoryDbModel,
          attributes: ['id']
        },
        {
          as: 'images',
          separate: true,
          model: ProductImageDbModel,
          attributes: ['id']
        },
        {
          as: 'parameterSets',
          separate: true,
          model: ProductParameterSetDbModel,
          attributes: ['id', 'productId', 'colorId', 'customParameterId', 'price', 'stock', 'purchasedNumber', 'enable']
        },
        {
          as: 'shippingFees',
          model: ProductShippingFeesDbModel,
          separate: true,
          attributes: ['quantityFrom', 'quantityTo', 'shippingFee', 'overseasShippingFee'],
          include: [
            {
              as: 'regionalShippingFees',
              model: ProductRegionalShippingFeesDbModel,
              separate: true,
              attributes: ['prefectureCode', 'shippingFee']
            }
          ]
        }
      ]
    });
    return product;
  }

  async getById(productId: number, quantity: number, language?: LanguageEnum): Promise<IProduct> {
    const product: IProductDao = await this.services.productRepository.getById(productId);
    const productContent: any = selectWithLanguage(product?.contents, language, false);
    const productImages: any = selectWithLanguage(product?.images, language, true);

    const shop: IShopDao = await this.services.shopRepository.getById(product?.shopId);
    const shopContent: any = selectWithLanguage(shop?.contents, language, false);
    const shopImages: any = selectWithLanguage(shop?.images, language, true);
    const totalPublishedProducts: number = await this.countOnlineProductsByShopAndStatus(shop?.id, [ProductStatusEnum.PUBLISHED]);
    const [taxPercents, shippingFeeWithTax, coinRewardPercents] = await Promise.all([
      this.services.configRepository.getTaxPercents(),
      this.services.configRepository.getShippingFeeWithTax(),
      this.services.configRepository.getCoinRewardPercents()
    ]);
    const calculateProductAmountParams: ICalculateProductAmountParam = {
      productPrice: product.price || 0,
      taxPercents,
      shippingFeeWithTax,
      quantity,
      coinRewardPercents
    };
    const { totalPrice, totalPriceWithTax, totalCashbackCoin, amount } = calculateProductAmount(calculateProductAmountParams);

    const result = {
      ...product,
      content: productContent,
      images: productImages,
      shop: {
        ...shop,
        content: shopContent,
        images: shopImages,
        totalPublishedProducts
      },
      quantity,
      shippingFeeWithTax,
      totalPrice,
      totalPriceWithTax,
      cashbackCoinRate: coinRewardPercents,
      totalCashbackCoin,
      amount
    } as IProduct;
    delete result.contents;
    delete result.shop.contents;

    return result;
  }

  async getOnlineProductByNameId(productNameId: string, quantity: number, language?: LanguageEnum): Promise<IProduct | null> {
    const product: IProductDao = await this.services.productRepository.getOneByNameId(productNameId);

    if (!product) {
      return null;
    }

    const productContent: any = selectWithLanguage(product?.contents, language, false);
    const productImages: any = selectWithLanguage(product?.images, language, true);
    const productStory: any = selectWithLanguage(product?.stories, language, false);
    const productMaterials: any = selectWithLanguage(product?.materials, language, true);
    const productColors: any = selectWithLanguage(product?.colors, language, true);
    const productPatterns: any = selectWithLanguage(product?.patterns, language, true);
    const productCustomParameters: any = selectWithLanguage(product?.customParameters, language, true);
    const productCategory: any = selectWithLanguage(product?.categories, language, false);
    const productTransparencyTransfer: any = this.transformToProductTransparencyTransfer(product, language);

    const shop: IShopDao = await this.services.shopRepository.getById(product?.shopId);
    const shopSettings = await this.services.shopService.getSettings(product?.shopId);
    const shopContent: any = selectWithLanguage(shop?.contents, language, false);
    const shopImages: any = selectWithLanguage(shop?.images, language, true);
    const totalPublishedProducts: number = await this.countOnlineProductsByShopAndStatus(shop?.id, [ProductStatusEnum.PUBLISHED]);
    const [taxPercents, shippingFeeWithTax, coinRewardPercents] = await Promise.all([
      this.services.configRepository.getTaxPercents(),
      this.services.configRepository.getShippingFeeWithTax(),
      this.services.configRepository.getCoinRewardPercents()
    ]);
    const calculateProductAmountParams: ICalculateProductAmountParam = {
      productPrice: product.price || 0,
      taxPercents,
      shippingFeeWithTax,
      quantity,
      coinRewardPercents
    };
    const { priceWithTax, totalPrice, totalPriceWithTax, cashbackCoin, amount, totalCashbackCoin } = calculateProductAmount(
      calculateProductAmountParams
    );

    const shippingFees = await this.services.productShippingFeesService.getByProductId(product.id);

    const result = {
      ...product,
      shippingFees,
      content: productContent,
      images: productImages,
      story: productStory,
      categories: _.isEmpty(productCategory) ? [] : [productCategory],
      transparency: productTransparencyTransfer,
      materials: productMaterials,
      colors: productColors,
      patterns: productPatterns,
      customParameters: productCustomParameters,
      shop: {
        ...shop,
        ...shopSettings,
        content: shopContent,
        images: shopImages,
        totalPublishedProducts
      },
      quantity,
      priceWithTax,
      shippingFeeWithTax,
      totalPrice,
      totalPriceWithTax,
      cashbackCoinRate: coinRewardPercents,
      cashbackCoin,
      totalCashbackCoin,
      amount
    };
    delete result.stories;
    delete result.contents;
    delete result.shop.contents;
    delete result.transparencies;
    delete result.locations;
    delete result.producers;
    delete result.highlightPoints;
    delete result.rarenessLevel;
    delete result.rarenessTotalPoint;
    delete result.sdgs;
    delete result.ethicalLevel;
    result.images.forEach((item: IProductImageModel) => delete item.language);

    return result;
  }

  async getInstoreProductByNameId(productNameId: string, quantity: number, language?: LanguageEnum): Promise<IProduct | null> {
    const product: IProductDao = await this.services.productRepository.getOneInstoreProductByNameId(productNameId);

    if (!product) {
      return null;
    }

    const productContent: any = selectWithLanguage(product?.contents, language, false);
    const productImages: any = selectWithLanguage(product?.images, language, true);
    const productColors: any = selectWithLanguage(product?.colors, language, true);
    const productCustomParameters: any = selectWithLanguage(product?.customParameters, language, true);

    const shop: IShopDao = await this.services.shopRepository.getById(product?.shopId);
    const shopContent: any = selectWithLanguage(shop?.contents, language, false);
    const shopImages: any = selectWithLanguage(shop?.images, language, true);

    const [taxPercents, shippingFeeWithTax, coinRewardPercents] = await Promise.all([
      this.services.configRepository.getTaxPercents(),
      this.services.configRepository.getShippingFeeWithTax(),
      this.services.configRepository.getCoinRewardPercents()
    ]);
    const calculateProductAmountParams: ICalculateProductAmountParam = {
      productPrice: product.price || 0,
      taxPercents,
      shippingFeeWithTax,
      quantity,
      coinRewardPercents
    };
    const { priceWithTax, totalPrice, totalPriceWithTax, cashbackCoin, amount, totalCashbackCoin } = calculateProductAmount(
      calculateProductAmountParams
    );

    const shippingFees = await this.services.productShippingFeesService.getByProductId(product.id);

    const result = {
      ...product,
      shippingFees,
      content: productContent,
      images: productImages,
      colors: productColors,
      customParameters: productCustomParameters,
      shop: {
        ...shop,
        content: shopContent,
        images: shopImages
      },
      quantity,
      priceWithTax,
      shippingFeeWithTax,
      totalPrice,
      totalPriceWithTax,
      cashbackCoinRate: coinRewardPercents,
      cashbackCoin,
      totalCashbackCoin,
      amount
    };
    delete result.contents;
    delete result.rarenessLevel;
    delete result.rarenessTotalPoint;
    delete result.ethicalLevel;
    delete result.transparencyLevel;
    delete result.recycledMaterialPercent;
    delete result.materialNaturePercent;
    delete result.sdgs;

    result.images.forEach((item: IProductImageModel) => delete item.language);

    return result;
  }

  async getOneById(id: number): Promise<IProductDao> {
    const product: IProductDao = await this.services.productRepository.getOneById(id);

    return product;
  }

  async getOnlineProductForCloneInstore(ids: number[]): Promise<IProductDao[]> {
    const products = await this.services.productRepository.findAll({
      where: {
        id: ids,
        salesMethod: SalesMethodEnum.ONLINE
      },
      include: [
        contentsClone,
        imagesClone,
        colorsClone,
        customParametersClone,
        regionalShippingFeesClone,
        shippingFeesClone,
        parameterSetsClone
      ],
      attributes: [
        'shopId',
        'userId',
        'isFeatured',
        'price',
        'shippingFee',
        'shippingFeeWithTax',
        'stock',
        'productWeight',
        'isShippingFeesEnabled',
        'isFreeShipment',
        'allowInternationalOrders',
        'overseasShippingFee',
        'hasParameters',
        'salesMethod',
        'shipLaterStock',
        'displayPosition'
      ]
    });

    return products;
  }

  async countOnlineProduct(userId: number, transaction?: Transaction): Promise<ICountProductsByStatus> {
    const [unpublishedItems, publishedItems] = await Promise.all([
      this.countProductsByUserAndStatus(
        userId,
        [ProductStatusEnum.DRAFT, ProductStatusEnum.UNPUBLISHED],
        SalesMethodEnum.ONLINE,
        transaction
      ),
      this.countProductsByUserAndStatus(userId, [ProductStatusEnum.PUBLISHED], SalesMethodEnum.ONLINE, transaction)
    ]);

    const result = {
      publishedItems,
      unpublishedItems
    } as ICountProductsByStatus;

    return result;
  }

  async countProductsByUserAndStatus(
    userId: number,
    statusList: ProductStatusEnum[],
    salesMethod = SalesMethodEnum.ONLINE,
    transaction?: Transaction
  ): Promise<number> {
    const numberOfItems = await this.services.productRepository.count({
      where: { userId, status: statusList, salesMethod },
      transaction
    });

    return numberOfItems;
  }

  async countOnlineProductsByShopAndStatus(shopId: number, statusList: ProductStatusEnum[], transaction?: Transaction): Promise<number> {
    const numberOfItems = await this.services.productRepository.count({
      where: { shopId, status: statusList, salesMethod: SalesMethodEnum.ONLINE },
      transaction
    });

    return numberOfItems;
  }

  async publishById(productId: number, transaction?: Transaction): Promise<boolean> {
    await this.services.productRepository.update(
      { status: ProductStatusEnum.PUBLISHED, publishedAt: new Date() as any },
      { where: { id: productId }, transaction }
    );
    return true;
  }

  async unpublishById(productId: number, transaction?: Transaction): Promise<boolean> {
    await this.services.productRepository.update({ status: ProductStatusEnum.UNPUBLISHED }, { where: { id: productId }, transaction });
    return true;
  }

  async deleteById(productId: number, transaction?: Transaction): Promise<boolean> {
    await this.services.productRepository.update(
      { status: ProductStatusEnum.DELETED, deletedAt: new Date() as any },
      { where: { id: productId }, transaction }
    );

    return true;
  }

  async updatePurchasedNumber(productId: number, quantity: number, transaction?: Transaction): Promise<boolean> {
    await this.services.productRepository.increasePurchasedNumber({ by: quantity, where: { id: productId }, transaction });
    return true;
  }

  async updateProductLocation(productId: number, location: IProductLocationModel, transaction?: Transaction): Promise<void> {
    if (_.isEmpty(location) || (location.id && !location.place)) {
      await this.services.productLocationRepository.delete({
        where: {
          productId
        }
      });
    } else {
      if (location.id) {
        await this.services.productLocationRepository.update(location, {
          where: {
            id: location.id
          },
          transaction
        });
      } else if (location.place) {
        await this.services.productLocationRepository.create(
          {
            ...location,
            productId
          },
          { transaction }
        );
      }
    }
  }

  async createMaterials(productId: number, materials: IProductMaterialModel[], transaction?: Transaction): Promise<IProductMaterialModel> {
    const createdProductMaterials = await this.services.productMaterialRepository.bulkCreate(
      materials.map(item => {
        return {
          productId,
          material: item.material,
          percent: item.percent,
          displayPosition: item.displayPosition,
          isOrigin: item.isOrigin
        };
      }),
      { transaction }
    );

    return createdProductMaterials;
  }

  async updateMaterials(productId: number, materials: IProductMaterialModel[], transaction?: Transaction) {
    const materialIds = materials.map(item => (item.id ? item.id : 0));
    await this.services.productMaterialRepository.delete({
      where: {
        id: {
          [Op.notIn]: materialIds
        },
        productId
      }
    });

    const createMaterialObjects: IProductMaterialModel[] = [];

    materials.map(item => {
      if (item.id) {
        return this.services.productMaterialRepository.update(item, {
          where: {
            id: item.id
          },
          transaction
        });
      }
      createMaterialObjects.push(item);
    });

    await this.createMaterials(productId, createMaterialObjects, transaction);
  }

  async updatePositionByProductNameId(userId: number, products: IProductDisplayPositionModel[], transaction?: Transaction): Promise<void> {
    const updatePosition = [];

    for (const product of products) {
      updatePosition.push(this.services.productRepository.update(product, { where: { nameId: product.nameId, userId }, transaction }));
    }
    await Promise.all(updatePosition);
  }

  async updateInstoreProductCode(shopId: number, productId: number, transaction?: Transaction): Promise<void> {
    const generateCode = `${zeroPaddingID(shopId, this.DEFAULT_ID_LENGTH)}-${zeroPaddingID(productId, this.DEFAULT_ID_LENGTH)}`;

    await this.services.productRepository.update({ code: generateCode }, { where: { id: productId }, transaction });
  }

  async disableProductsShippingFeesSettingsByShopId(shopId: number, transaction?: Transaction): Promise<void> {
    await this.services.productRepository.update(
      { isShippingFeesEnabled: false },
      { where: { shopId, status: ProductStatusEnum.PUBLISHED, salesMethod: SalesMethodEnum.ONLINE }, transaction }
    );
  }

  async enableFreeShippingForDefaultShippingProductsByShopId(shopId: number, transaction?: Transaction): Promise<void> {
    const allPublicProductsWithShippingInfo = await this.services.productRepository.findAll({
      where: { shopId, status: ProductStatusEnum.PUBLISHED, salesMethod: SalesMethodEnum.ONLINE },
      include: [/* regionalShippingFeesClone, */ shippingFeesClone],
      attributes: [
        'shopId',
        'shippingFee',
        'isShippingFeesEnabled',
        'isFreeShipment'
        // 'allowInternationalOrders',
        // 'overseasShippingFee'
      ]
    });

    const disableProductsWithShippingSettings: number[] = [];
    const disableProductsWithoutShippingSettings: number[] = [];

    allPublicProductsWithShippingInfo.forEach(product => {
      if (product.isShippingFeesEnabled) {
        return;
      }

      if (product.isFreeShipment || (!product.isFreeShipment && (product.shippingFee || product.shippingFees?.length))) {
        disableProductsWithShippingSettings.push(product.id);
        return;
      }

      disableProductsWithoutShippingSettings.push(product.id);
    });

    await Promise.all([
      this.services.productRepository.update(
        { isShippingFeesEnabled: true },
        {
          where: { id: disableProductsWithShippingSettings },
          transaction
        }
      ),
      this.services.productRepository.update(
        { isShippingFeesEnabled: true, isFreeShipment: true },
        {
          where: { id: disableProductsWithoutShippingSettings },
          transaction
        }
      )
    ]);
  }

  private async mappingProductResponse(products: IProductDao[], language?: LanguageEnum): Promise<IProduct[]> {
    const [taxPercents, shippingFeeWithTax, coinRewardPercents] = await Promise.all([
      this.services.configRepository.getTaxPercents(),
      this.services.configRepository.getShippingFeeWithTax(),
      this.services.configRepository.getCoinRewardPercents()
    ]);
    return Promise.all(
      products.map(async item => {
        const shop: IShopDao = await this.services.shopRepository.getById(item?.shopId);
        const shopContent: any = selectWithLanguage(shop?.contents, language, false);
        const shopImages: any = selectWithLanguage(shop?.images, language, true);

        const content: any = selectWithLanguage(item.contents, language, false);
        const images: any = selectWithLanguage(item.images, language, true);
        const story: any = selectWithLanguage(item.stories, language, false);
        const materials: any = selectWithLanguage(item.materials, language, true);
        const colors: any = selectWithLanguage(item.colors, language, true);
        const patterns: any = selectWithLanguage(item.patterns, language, true);
        const customParameters: any = selectWithLanguage(item.customParameters, language, true);
        const category: any = selectWithLanguage(item.categories, language, false);
        const producers: any = selectWithLanguage(item.producers, language, true);
        const highlightPoints: number[] = item.highlightPoints ? item.highlightPoints.map(({ id }) => id) : [];
        const categoryId: any = item.categories && item.categories.length ? item.categories[0].id : undefined;

        let priceWithTax = null;
        let cashbackCoin = null;

        if (item.price !== null) {
          const calculateProductAmountParams: ICalculateProductAmountParam = {
            productPrice: item.price || 0,
            taxPercents,
            shippingFeeWithTax,
            quantity: 1,
            coinRewardPercents
          };
          const calculatedProductAmount = calculateProductAmount(calculateProductAmountParams);
          priceWithTax = calculatedProductAmount.priceWithTax;
          cashbackCoin = calculatedProductAmount.cashbackCoin;
        }

        const result = {
          ...item,
          story,
          content,
          images,
          categories: _.isEmpty(category) ? [] : [category],
          categoryId,
          materials,
          colors,
          patterns,
          customParameters,
          priceWithTax,
          cashbackCoin,
          cashbackCoinRate: coinRewardPercents,
          shippingFeeWithTax,
          transparency: {
            producers,
            highlightPoints
          },
          shop: {
            ...shop,
            content: shopContent,
            images: shopImages
          }
        } as IProduct;

        delete result.contents;
        delete result.stories;
        delete result.producers;
        delete result.highlightPoints;
        return result;
      })
    );
  }

  private mappingInstoreProductResponse(products: IProductDao[], language?: LanguageEnum): Promise<IProduct[]> {
    return Promise.all(
      products.map(async item => {
        const shop: IShopDao = await this.services.shopRepository.getById(item?.shopId);
        const shopContent: any = selectWithLanguage(shop?.contents, language, false);
        const shopImages: any = selectWithLanguage(shop?.images, language, true);

        const content: any = selectWithLanguage(item.contents, language, false);
        const images: any = selectWithLanguage(item.images, language, true);
        const colors: any = selectWithLanguage(item.colors, language, true);
        const customParameters: any = selectWithLanguage(item.customParameters, language, true);

        const result = {
          ...item,
          content,
          images,
          colors,
          customParameters,
          shop: {
            ...shop,
            content: shopContent,
            images: shopImages
          }
        } as IProduct;

        delete result.rarenessLevel;
        delete result.rarenessTotalPoint;
        delete result.cashbackCoinRate;
        delete result.cashbackCoin;
        delete result.productWeight;
        delete result.ethicalLevel;
        delete result.transparencyLevel;
        delete result.highlightPoints;
        delete result.rarenessLevel;
        delete result.rarenessTotalPoint;
        delete result.sdgs;

        return result;
      })
    );
  }

  private transformToProductTransparency(productTransparencyTransfer: IProductTransparencyTransferModel): IProductTransparencyModel {
    const {
      id,
      contributionDetails,
      plainTextContributionDetails,
      culturalProperty,
      plainTextCulturalProperty,
      effect,
      plainTextEffect,
      recycledMaterialDescription,
      plainTextRecycledMaterialDescription,
      sdgsReport,
      plainTextSdgsReport,
      rarenessDescription
    } = productTransparencyTransfer;

    return {
      id,
      recycledMaterialDescription,
      plainTextRecycledMaterialDescription,
      sdgsReport,
      plainTextSdgsReport,
      contributionDetails,
      plainTextContributionDetails,
      effect,
      plainTextEffect,
      culturalProperty,
      plainTextCulturalProperty,
      rarenessDescription,
      isOrigin: true
    };
  }

  private async getTransparencyLevels(productTransparency: IProductTransparencyTransferModel): Promise<ICalculateProductTransparencyLevel> {
    const query: string[] = [];
    const inputtedTranparencyFields: string[] = [];

    PRODUCT_TRANSPARENCY_FIELDS.map((item: IProductTransparencyFields) => {
      const transparencyField = (productTransparency as any)[item.productTransparencyField];
      if (
        transparencyField &&
        (_.isNumber(transparencyField) || _.isString(transparencyField) || !_.isEmpty(transparencyField) || transparencyField.length)
      ) {
        if (item.type === HighlightTypeEnum.ETHICALITY_LEVEL) {
          query.push(item.transparencyField);
        }
        inputtedTranparencyFields.push(item.transparencyField);
      }
    });

    if (productTransparency.location?.place) {
      query.push(EthicalityLevelFieldEnum.LOCATION);
      inputtedTranparencyFields.push(EthicalityLevelFieldEnum.LOCATION);
    }
    const transparencyLevel = [...new Set(inputtedTranparencyFields)].length;

    const ethicalityLevel = await this.calculateProductEthicalityLevel(productTransparency, query);
    return {
      ethicalityLevel,
      transparencyLevel
    };
  }

  private async calculateProductEthicalityLevel(productTransparency: IProductTransparencyTransferModel, query: string[]): Promise<number> {
    const ethicalityLevels = await this.services.ethicalityLevelRepository.findAll({
      where: {
        field: {
          [Op.in]: query
        },
        deletedAt: null
      },
      attributes: ['point']
    });
    const ethicalityLevelTotalPoints = ethicalityLevels.reduce((total: number, item) => {
      return total + item.point;
    }, 0);

    const selectedEthicalityHighlightPoints = await this.services.highlightPointRepository.getAllByTypeAndIds(
      productTransparency.highlightPoints ? productTransparency.highlightPoints : [],
      HighlightTypeEnum.ETHICALITY_LEVEL
    );

    const ethicalityLevelHighlightPoints = selectedEthicalityHighlightPoints
      ? selectedEthicalityHighlightPoints.reduce((total, highlightPoint) => total + (highlightPoint.value || 0), 0)
      : 0;

    const ethicalityLevel = ethicalityLevelTotalPoints + ethicalityLevelHighlightPoints;
    return ethicalityLevel;
  }

  private transformToProductTransparencyTransfer(product: IProductDao, language?: LanguageEnum): IProductTransparencyTransferModel {
    const productLocation: any = selectWithLanguage(product?.locations, language, false);
    const productMaterials: any = selectWithLanguage(product?.materials, language, true);
    const productTransparency: any = selectWithLanguage(product?.transparencies, language, false);
    const productProducers: any = selectWithLanguage(product?.producers, language, true);
    const productHighlightPoints: number[] = product.highlightPoints ? product.highlightPoints.map(item => item.id) : [];
    const productSDGs: number[] = product.sdgs ? JSON.parse(product.sdgs) : [];

    const {
      id = null,
      contributionDetails = null,
      culturalProperty = null,
      effect = null,
      recycledMaterialDescription = null,
      sdgsReport = null,
      rarenessDescription = null
    } = productTransparency;

    let result = {
      ethicalLevel: product.ethicalLevel,
      location: productLocation,
      materialNaturePercent: product.materialNaturePercent,
      materials: productMaterials,
      producers: productProducers,
      highlightPoints: productHighlightPoints,
      sdgs: productSDGs,
      sdgsReport,
      recycledMaterialPercent: product.recycledMaterialPercent,
      rarenessLevel: product.rarenessLevel,
      recycledMaterialDescription,
      contributionDetails,
      effect,
      culturalProperty,
      rarenessDescription,
      rarenessTotalPoint: product.rarenessTotalPoint
    } as IProductTransparencyTransferModel;

    result = id ? { ...result, ...{ id } } : result;
    return result;
  }

  private convertProductCoordinateType(coordinate?: { lat: number; lng: number }): IGeometry | undefined {
    if (!coordinate || !coordinate.lat || !coordinate.lng) {
      return undefined;
    }

    const geometryCoordinate: IGeometry = {
      type: GeometryTypeEnum.POINT,
      coordinates: [coordinate.lng, coordinate.lat]
    };
    return geometryCoordinate;
  }

  private async getProductIdsByHighlightPointsIdFromEachShop(paginationOptions: IProductPaginationOptions, highlightPointsId: number) {
    type ITmpProduct = Pick<IProductModel, 'id' | 'shopId'> & Pick<IProductHighlightPointModel, 'id'>;

    const { highlightPoints } = PRODUCT_RELATED_MODELS;

    const tmpProducts: ITmpProduct[] = await this.services.productRepository.getList(paginationOptions, {
      where: { status: ProductStatusEnum.PUBLISHED, salesMethod: SalesMethodEnum.ONLINE },
      attributes: ['id', 'shopId', 'createdAt', 'publishedAt'],
      include: [{ ...highlightPoints, where: { id: highlightPointsId } }],
      order: [
        [PRODUCT_FIELDS.CREATED_AT, ORDER.DESC],
        [PRODUCT_FIELDS.PUBLISHED_AT, ORDER.DESC]
      ]
    });

    const productIdsByShopId: Map<number, number[]> = tmpProducts.reduce((acc, product) => {
      const mapKey = product.shopId;

      if (!acc.has(mapKey)) {
        acc.set(mapKey, []);
      }

      const tmpProductIds = acc.get(mapKey);

      if (tmpProductIds) {
        tmpProductIds.push(product.id);
      }

      return acc;
    }, new Map<number, number[]>());

    const queryProductIds: number[] = [];

    productIdsByShopId.forEach(tmpProductIds => {
      queryProductIds.push(tmpProductIds[Math.floor(Math.random() * tmpProductIds.length)]);
    });

    return queryProductIds;
  }

  private async getProductIdsOneFromEachShopByTransparency(paginationOptions: IProductPaginationOptions) {
    type ITmpProduct = Pick<IProductModel, 'id' | 'shopId' | 'transparencyLevel'>;

    const tmpProducts: ITmpProduct[] = await this.services.productRepository.getList(paginationOptions, {
      where: { status: ProductStatusEnum.PUBLISHED, salesMethod: SalesMethodEnum.ONLINE },
      attributes: ['id', 'shopId', 'transparencyLevel'],
      order: [
        [PRODUCT_FIELDS.TRANSPARENCY_LEVEL, ORDER.DESC],
        [PRODUCT_FIELDS.RARENESS_LEVEL, ORDER.DESC],
        [PRODUCT_FIELDS.PUBLISHED_AT, ORDER.DESC]
      ]
    });

    const productIdsByShopIdAndTransparencyLevel: Map<string, number[]> = tmpProducts.reduce((acc, product) => {
      const mapKey = `${product.shopId}:${product.transparencyLevel || 0}`;

      if (!acc.has(mapKey)) {
        acc.set(mapKey, []);
      }

      const tmpProductIds = acc.get(mapKey);

      if (tmpProductIds) {
        tmpProductIds.push(product.id);
      }

      return acc;
    }, new Map<string, number[]>());

    const queryProductIds: number[] = [];

    productIdsByShopIdAndTransparencyLevel.forEach(tmpProductIds => {
      queryProductIds.push(tmpProductIds[Math.floor(Math.random() * tmpProductIds.length)]);
    });

    return queryProductIds;
  }

  private async getProductIdsOneFromEachShopByEthical(paginationOptions: IProductPaginationOptions) {
    type ITmpProduct = Pick<IProductModel, 'id' | 'shopId' | 'ethicalLevel'>;

    const tmpProducts: ITmpProduct[] = await this.services.productRepository.getList(paginationOptions, {
      where: { status: ProductStatusEnum.PUBLISHED, salesMethod: SalesMethodEnum.ONLINE },
      attributes: ['id', 'shopId', 'ethicalLevel'],
      order: [
        [PRODUCT_FIELDS.ETHICAL_LEVEL, ORDER.DESC],
        [PRODUCT_FIELDS.RARENESS_LEVEL, ORDER.DESC],
        [PRODUCT_FIELDS.PUBLISHED_AT, ORDER.DESC]
      ]
    });

    const productIdsByShopIdAndEthicalLevel: Map<string, number[]> = tmpProducts.reduce((acc, product) => {
      const mapKey = `${product.shopId}:${product.ethicalLevel || 0}`;

      if (!acc.has(mapKey)) {
        acc.set(mapKey, []);
      }

      const tmpProductIds = acc.get(mapKey);

      if (tmpProductIds) {
        tmpProductIds.push(product.id);
      }

      return acc;
    }, new Map<string, number[]>());

    const queryProductIds: number[] = [];

    productIdsByShopIdAndEthicalLevel.forEach(tmpProductIds => {
      queryProductIds.push(tmpProductIds[Math.floor(Math.random() * tmpProductIds.length)]);
    });

    return queryProductIds;
  }
}

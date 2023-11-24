// import Logger from '@freewilltokyo/logger';

import sequelize, {
  CreateOptions,
  FindAndCountOptions,
  FindOptions,
  IncrementDecrementOptionsWithBy,
  Op,
  OrderItem,
  Sequelize
} from 'sequelize';

// const SqlString = require('sequelize/lib/sql-string');

import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER, DEFAULT_TOP_PRODUCTS_LIST_LIMIT } from '../../constants';
import { IProductPaginationOptions, IProductSortQuery, ISearchQuery } from '../../controllers/product/interfaces';
import { ProductContentDbModel, ProductDbModel, ProductStatusEnum, ProductStoryDbModel, SalesMethodEnum } from '../../database';
import { BaseRepository, IFindAndCountResult, IPaginationOptions, IRepository } from '../_base';

import {
  ORDER,
  PRODUCT_CLONING_MODELS,
  PRODUCT_FIELDS,
  PRODUCT_RELATED_MODELS,
  PRODUCT_STATUS_ORDER_MODEL,
  SEARCH_PARAMETER_MAPPING,
  SORT_SEARCH_RESULT_PARAMETERS_MATCHING_REGEX
} from './constants';
import { IProductDao } from './interfaces';

// const log = new Logger('DAL:ProductRepository');
const {
  shop,
  contents,
  stories,
  images,
  materials,
  colors,
  patterns,
  customParameters,
  highlightPoints,
  transparencies,
  categories,
  locations,
  producers,
  regionalShippingFees,
  parameterSets
} = PRODUCT_RELATED_MODELS;

const {
  contentsClone,
  storiesClone,
  imagesClone,
  materialsClone,
  colorsClone,
  patternsClone,
  customParametersClone,
  highlightPointsClone,
  transparenciesClone,
  locationsClone,
  producersClone,
  shippingFeesClone,
  regionalShippingFeesClone,
  parameterSetsClone,
  categoriesClone
} = PRODUCT_CLONING_MODELS;

export interface IProductRepository extends IRepository<IProductDao> {
  getOneByNameId(nameId: string, options?: FindOptions): Promise<IProductDao>;

  getOneInstoreProductByNameId(nameId: string, options?: FindOptions): Promise<IProductDao>;

  getOneById(id: number): Promise<IProductDao>;

  getPublicOneByNameId(nameId: string, options?: FindOptions): Promise<IProductDao>;

  getPublishedOnlineProductListByShopId(shopId: number, options?: IPaginationOptions): Promise<IFindAndCountResult<IProductDao>>;

  getByGeolocationDistance(lng: number, lat: number): Promise<IProductDao[]>;

  getList(paginationOptions: IProductPaginationOptions, findOptions?: FindOptions, sortType?: string): Promise<any[]>;

  getAllProducts(
    shopId: number,
    salesMethod: SalesMethodEnum,
    optionsQuery: IProductSortQuery | IProductPaginationOptions
  ): Promise<IFindAndCountResult<IProductDao>>;

  getProducts(searchQuery: ISearchQuery, salesMethod: SalesMethodEnum): Promise<IFindAndCountResult<IProductDao>>;

  increasePurchasedNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IProductDao>>;

  increaseDisplayPosition(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IProductDao>>;

  decreaseStockNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IProductDao>>;
  decreaseShipLaterStockNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IProductDao>>;

  createProduct(product: Partial<IProductDao>, options?: CreateOptions): Promise<IProductDao>;

  bulkUpdatePositionFromId(productIds: number[], options?: CreateOptions): Promise<boolean>;

  escape(escapeString: string): string;
}

export class ProductRepository extends BaseRepository<IProductDao> implements IProductRepository {
  constructor() {
    super(ProductDbModel);
  }

  getById(id: number, options: FindOptions) {
    return super.getById(id, {
      ...options,
      include: [...(options?.include || []), shop, contents, images]
    });
  }

  getOneByNameId(nameId: string, options?: FindOptions): Promise<IProductDao> {
    return this.findOne({
      ...options,
      where: {
        [Op.and]: [options?.where || {}, { nameId }, { salesMethod: SalesMethodEnum.ONLINE }]
      },
      include: [
        ...(options?.include || []),
        shop,
        contents,
        stories,
        images,
        categories,
        materials,
        colors,
        patterns,
        customParameters,
        transparencies,
        highlightPoints,
        locations,
        producers,
        regionalShippingFees,
        parameterSets
      ]
    });
  }

  getOneInstoreProductByNameId(nameId: string, options?: FindOptions): Promise<IProductDao> {
    return this.findOne({
      ...options,
      where: {
        [Op.and]: [options?.where || {}, { nameId }, { salesMethod: SalesMethodEnum.INSTORE }]
      },
      include: [...(options?.include || []), shop, contents, images, colors, customParameters, regionalShippingFees, parameterSets]
    });
  }

  getOneById(id: number): Promise<IProductDao> {
    return this.findOne({
      where: {
        id
      },
      include: [
        contentsClone,
        storiesClone,
        imagesClone,
        materialsClone,
        colorsClone,
        patternsClone,
        locationsClone,
        transparenciesClone,
        customParametersClone,
        producersClone,
        regionalShippingFeesClone,
        shippingFeesClone,
        parameterSetsClone,
        highlightPointsClone,
        categoriesClone
      ],
      attributes: [
        'shopId',
        'userId',
        'isFeatured',
        'rarenessLevel',
        'rarenessTotalPoint',
        'price',
        'cashbackCoinRate',
        'cashbackCoin',
        'shippingFee',
        'shippingFeeWithTax',
        'stock',
        'productWeight',
        'isShippingFeesEnabled',
        'isFreeShipment',
        'ethicalLevel',
        'transparencyLevel',
        'recycledMaterialPercent',
        'materialNaturePercent',
        'sdgs',
        'coordinate',
        'labelId',
        'allowInternationalOrders',
        'overseasShippingFee',
        'hasParameters',
        'salesMethod',
        'shipLaterStock',
        'displayPosition'
      ]
    });
  }

  getPublicOneByNameId(nameId: string, options?: FindOptions): Promise<IProductDao> {
    return this.getOneByNameId(nameId, {
      ...options,
      where: {
        [Op.and]: [options?.where || {}, { nameId }, { status: ProductStatusEnum.PUBLISHED }]
      }
    });
  }

  getPublishedOnlineProductListByShopId(shopId: number, options?: IPaginationOptions): Promise<IFindAndCountResult<IProductDao>> {
    return this.findAndCountAll({
      limit: DEFAULT_LIMIT,
      offset: 0,
      ...options,
      where: {
        [Op.and]: [{ shopId }, { status: ProductStatusEnum.PUBLISHED }, { salesMethod: SalesMethodEnum.ONLINE }]
      },
      include: [shop, contents, images, categories, producers],
      order: [[PRODUCT_FIELDS.PUBLISHED_AT, ORDER.DESC]]
    }) as any;
  }

  getList(paginationOptions: IProductPaginationOptions, findOptions?: FindOptions): Promise<IProductDao[]> {
    const order = findOptions?.order as OrderItem[];
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER } = paginationOptions;
    const offset = (pageNumber - 1) * limit;
    return this.findAll({
      limit,
      offset,
      ...findOptions,
      order: [...order]
    }) as any;
  }

  getByGeolocationDistance(lng: number, lat: number): Promise<IProductDao[]> {
    const location = sequelize.literal(`ST_GeomFromText('POINT(${lng} ${lat})')`);
    const distance = sequelize.fn('ST_Distance_Sphere', sequelize.col(`coordinate`), location);

    return this.findAll({
      include: [locations, contents, images],
      where: { coordinate: { [Op.ne]: null } as any, status: ProductStatusEnum.PUBLISHED },
      attributes: [[distance, 'distance'], 'nameId', 'price', 'stock'],
      order: [[distance, 'ASC']],
      limit: DEFAULT_TOP_PRODUCTS_LIST_LIMIT,
      offset: 0
    });
  }

  getAllProducts(
    shopId: number,
    salesMethod: SalesMethodEnum,
    optionsQuery: IProductSortQuery | IProductPaginationOptions
  ): Promise<IFindAndCountResult<IProductDao>> {
    let findOptions: FindAndCountOptions;
    if (salesMethod === SalesMethodEnum.ONLINE) {
      findOptions = this.buildSortProductsOption(shopId, salesMethod, optionsQuery);
    } else {
      findOptions = this.buildInstoreProductsOption(shopId, salesMethod, optionsQuery);
    }
    return this.findAndCountAll(findOptions);
  }

  getProducts(searchQuery: ISearchQuery, salesMethod = SalesMethodEnum.ONLINE): Promise<IFindAndCountResult<IProductDao>> {
    const findOptions = this.buildFindOption(searchQuery);
    findOptions.where = {
      ...findOptions.where,
      salesMethod
    };

    const { searchText } = searchQuery;

    if (searchText) {
      const productContentQuery = `(SELECT product_id FROM ${ProductContentDbModel.tableName} where title like ${this.escape(
        `%${searchText}%`
      )})`;

      const productStoryQuery = `(SELECT product_id FROM ${ProductStoryDbModel.tableName} where plain_text_content like ${this.escape(
        `%${searchText}%`
      )})`;

      findOptions.where = {
        [Op.and]: [
          { status: ProductStatusEnum.PUBLISHED, salesMethod },
          {
            [Op.or]: [
              { id: { [Op.in]: Sequelize.literal(productContentQuery) } },
              { id: { [Op.in]: Sequelize.literal(productStoryQuery) } }
            ]
          }
        ]
      };

      return this.findAndCountAll(findOptions);
    }
    return this.findAndCountAll(findOptions);
  }

  increasePurchasedNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IProductDao>> {
    return this.increaseNumberValue(this.model.tableAttributes.purchasedNumber.fieldName, options);
  }

  increaseDisplayPosition(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IProductDao>> {
    return this.increaseNumberValue(this.model.tableAttributes.displayPosition.fieldName, options);
  }

  decreaseStockNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IProductDao>> {
    return this.decreaseNumberValue(this.model.tableAttributes.stock.fieldName, options);
  }

  decreaseShipLaterStockNumber(options?: IncrementDecrementOptionsWithBy): Promise<Partial<IProductDao>> {
    return this.decreaseNumberValue(this.model.tableAttributes.shipLaterStock.fieldName, options);
  }

  async createProduct(product: Partial<IProductDao>, options?: CreateOptions): Promise<IProductDao> {
    const createdProduct = await this.create(product, options);

    if (product.salesMethod && product.salesMethod === SalesMethodEnum.INSTORE) {
      await this.update({ displayPosition: createdProduct.id }, { where: { id: createdProduct.id }, transaction: options?.transaction });
    }

    return createdProduct;
  }

  async bulkUpdatePositionFromId(productIds: number[], options?: CreateOptions): Promise<boolean> {
    await this.update(
      {
        displayPosition: Sequelize.literal('id') as any
      },
      {
        where: {
          id: productIds
        },
        transaction: options?.transaction
      }
    );

    return true;
  }

  private buildFindOption(searchQuery: ISearchQuery): FindAndCountOptions {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER, categoryId, highlightPointsId, sort } = searchQuery;
    const offset = (pageNumber - 1) * limit;

    let orderBy: OrderItem[] = [];

    if (sort) {
      orderBy = sort
        .toLowerCase()
        .match(SORT_SEARCH_RESULT_PARAMETERS_MATCHING_REGEX)
        ?.map(matchedParameter => {
          const parameter = SEARCH_PARAMETER_MAPPING[matchedParameter] || matchedParameter;
          return parameter.split(',').map(value => {
            return SEARCH_PARAMETER_MAPPING[value] || null;
          });
        })
        .filter(item => !item.includes(null)) as OrderItem[];
    }

    if (orderBy.length === 0) {
      orderBy.push([PRODUCT_FIELDS.PUBLISHED_AT, ORDER.DESC]);
    }

    const findOptions: FindAndCountOptions = {
      limit,
      offset,
      where: { status: ProductStatusEnum.PUBLISHED },
      distinct: true,
      include: [
        shop,
        contents,
        stories,
        images,
        materials,
        colors,
        patterns,
        customParameters,
        producers,
        regionalShippingFees,
        { ...categories, ...(categoryId && { where: { id: categoryId } }) },
        { ...highlightPoints, ...(highlightPointsId && { where: { id: highlightPointsId } }) }
      ],
      order: orderBy
    };

    return findOptions;
  }

  private buildSortProductsOption(shopId: number, salesMethod: SalesMethodEnum, searchQuery: ISearchQuery): FindAndCountOptions {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER, sort, searchText } = searchQuery;
    const offset = (pageNumber - 1) * limit;

    let orderBy: OrderItem[] = [];
    if (sort) {
      orderBy = sort
        .toLowerCase()
        .match(SORT_SEARCH_RESULT_PARAMETERS_MATCHING_REGEX)
        ?.map(matchedParameter => {
          const parameter = SEARCH_PARAMETER_MAPPING[matchedParameter] || matchedParameter;
          return parameter.split(',').map(value => {
            return SEARCH_PARAMETER_MAPPING[value] || null;
          });
        })
        .filter(item => !item.includes(null)) as OrderItem[];
    }

    const indexStatus = orderBy.findIndex(element => element.toString().includes(PRODUCT_FIELDS.STATUS));
    const checkInventoryExist = orderBy.findIndex(element => element.toString().includes(PRODUCT_FIELDS.STOCK));

    const sortTypeStatus: string | null =
      indexStatus !== -1
        ? orderBy[indexStatus]
            ?.toString()
            ?.split(/[,]+/)
            ?.slice(-1)[0]
        : null;
    if (sortTypeStatus) {
      let sortLasted: string = PRODUCT_STATUS_ORDER_MODEL.STATUS_DESC;
      sortLasted = sortTypeStatus === ORDER.ASC ? PRODUCT_STATUS_ORDER_MODEL.STATUS_ASC : sortLasted;

      orderBy.splice(indexStatus, 1, sequelize.literal(sortLasted));
      if (checkInventoryExist === -1) {
        orderBy.splice(indexStatus + 1, 0, [PRODUCT_FIELDS.STOCK, sortTypeStatus]);
      }
    }

    const indexStock = orderBy.findIndex(element => element.toString().includes(PRODUCT_FIELDS.STOCK));
    const sortTypestock: string | null =
      indexStock !== -1
        ? orderBy[indexStock]
            ?.toString()
            ?.split(/[,]+/)
            ?.slice(-1)[0]
        : null;

    if (checkInventoryExist !== -1 && sortTypeStatus && sortTypestock) {
      if (sortTypeStatus === sortTypestock) {
        orderBy.splice(indexStock, 1, [
          sequelize.literal(PRODUCT_FIELDS.STOCK + ' = 0 '),
          sortTypeStatus === ORDER.ASC ? ORDER.DESC : ORDER.ASC
        ]);
        orderBy.splice(indexStock + 1, 0, [PRODUCT_FIELDS.STOCK, sortTypeStatus]);
      } else {
        orderBy.splice(indexStock, 1, [PRODUCT_FIELDS.STOCK, sortTypeStatus === ORDER.ASC ? ORDER.DESC : ORDER.ASC]);
        orderBy.splice(indexStock, 0, [
          sequelize.literal(
            `${PRODUCT_FIELDS.STOCK} != null or ( ${PRODUCT_FIELDS.STATUS} = 'published' and ${PRODUCT_FIELDS.STOCK} != 0 ) `
          ),
          sortTypeStatus
        ]);
      }
    } else if (sortTypestock) {
      const sortStock: string = sortTypestock === ORDER.ASC ? ORDER.DESC : ORDER.ASC;
      if (indexStatus === 0 && orderBy.length > 2 && checkInventoryExist === -1) {
        orderBy.splice(indexStatus + 1, 1, [sequelize.literal(PRODUCT_FIELDS.STOCK + ' in (null , 0) '), sortStock]);
      } else {
        orderBy.splice(indexStock, 0, [sequelize.literal(PRODUCT_FIELDS.STOCK + ' IS NULL '), sortTypestock]);
      }
    }

    if (orderBy.length === 0) {
      orderBy.push([PRODUCT_FIELDS.UPDATED_AT, ORDER.DESC]);
    }

    const productSortOptions: FindAndCountOptions = {
      limit,
      offset,
      where: {
        [Op.and]: [{ shopId }, { salesMethod }, { status: { [Op.ne]: ProductStatusEnum.DELETED } }]
      },
      distinct: true,
      include: [contents, images, colors, patterns, customParameters, parameterSets],
      order: orderBy,
      subQuery: false
    };

    if (searchText) {
      const productContentQuery = `(SELECT product_id FROM ${ProductContentDbModel.tableName} where title like ${this.escape(
        `%${searchText}%`
      )})`;

      productSortOptions.where = {
        ...productSortOptions.where,
        id: {
          [Op.in]: Sequelize.literal(productContentQuery)
        }
      };
    }

    return productSortOptions;
  }

  private buildInstoreProductsOption(shopId: number, salesMethod: SalesMethodEnum, searchQuery: ISearchQuery): FindAndCountOptions {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER } = searchQuery;
    const offset = (pageNumber - 1) * limit;

    const productInstoreOptions: FindAndCountOptions = {
      limit,
      offset,
      where: {
        [Op.and]: [{ shopId }, { salesMethod }, { status: { [Op.ne]: ProductStatusEnum.DELETED } }]
      },
      distinct: true,
      include: [contents, images, colors, customParameters, parameterSets],
      order: [
        [PRODUCT_FIELDS.DISPLAY_POSITION, ORDER.DESC],
        [PRODUCT_FIELDS.PRODUCT_ID, ORDER.DESC]
      ]
    };
    return productInstoreOptions;
  }
}

import { OrderItem } from 'sequelize/types';

import {
  CategoryDbModel,
  HighlightPointDbModel,
  ProductColorDbModel,
  ProductContentDbModel,
  ProductCustomParameterDbModel,
  ProductImageDbModel,
  ProductLocationDbModel,
  ProductMaterialDbModel,
  ProductParameterSetDbModel,
  ProductParameterSetImageDbModel,
  ProductPatternDbModel,
  ProductProducerDbModel,
  ProductRegionalShippingFeesDbModel,
  ProductShippingFeesDbModel,
  ProductStoryDbModel,
  ProductTransparencyDbModel,
  ShopContentDbModel,
  ShopDbModel,
  ShopImageDbModel
} from '../../database/models';

import { IMapping } from './interfaces';

export const ORDER = {
  DESC: 'DESC',
  ASC: 'ASC'
};

export const ORDER_BY_DISPLAY_POSITION: OrderItem = ['displayPosition', 'ASC'];

export const PRODUCT_RELATED_MODELS = {
  shop: {
    as: 'shop',
    model: ShopDbModel,
    attributes: [
      'id',
      'nameId',
      'userId',
      'isFeatured',
      'status',
      'website',
      'email',
      'phone',
      'isShippingFeesEnabled',
      'isFreeShipment',
      'shippingFee',
      'allowInternationalOrders',
      'overseasShippingFee',
      'minAmountFreeShippingDomestic',
      'minAmountFreeShippingOverseas',
      'publishedAt',
      'deletedAt'
    ]
  },
  shopWithContent: {
    as: 'shop',
    model: ShopDbModel,
    attributes: [
      'id',
      'nameId',
      'userId',
      'isFeatured',
      'platformPercents',
      'status',
      'website',
      'email',
      'phone',
      'isShippingFeesEnabled',
      'isFreeShipment',
      'shippingFee',
      'allowInternationalOrders',
      'overseasShippingFee',
      'minAmountFreeShippingDomestic',
      'minAmountFreeShippingOverseas',
      'publishedAt',
      'deletedAt'
    ],
    include: [
      {
        as: 'contents',
        model: ShopContentDbModel,
        separate: true,
        attributes: ['title', 'subTitle', 'description', 'policy', 'isOrigin', 'language']
      },
      {
        as: 'images',
        model: ShopImageDbModel,
        separate: true,
        attributes: ['id', 'imagePath', 'imageDescription', 'isOrigin', 'language']
      }
    ]
  },
  contents: {
    as: 'contents',
    model: ProductContentDbModel,
    separate: true,
    attributes: ['id', 'title', 'subTitle', 'description', 'annotation', 'isOrigin', 'language']
  },
  images: {
    as: 'images',
    model: ProductImageDbModel,
    separate: true,
    attributes: ['id', 'imagePath', 'imageDescription', 'isOrigin', 'language']
  },
  stories: {
    as: 'stories',
    model: ProductStoryDbModel,
    separate: true,
    attributes: ['id', 'content', 'summaryContent', 'plainTextContent', 'plainTextSummaryContent', 'isOrigin', 'language']
  },
  materials: {
    as: 'materials',
    model: ProductMaterialDbModel,
    separate: true,
    attributes: ['id', 'material', 'percent', 'displayPosition', 'isOrigin', 'language'],
    order: [ORDER_BY_DISPLAY_POSITION]
  },
  colors: {
    as: 'colors',
    model: ProductColorDbModel,
    separate: true,
    attributes: ['id', 'color', 'displayPosition', 'isOrigin', 'language'],
    order: [ORDER_BY_DISPLAY_POSITION]
  },
  patterns: {
    as: 'patterns',
    model: ProductPatternDbModel,
    separate: true,
    attributes: ['id', 'pattern', 'displayPosition', 'isOrigin', 'language'],
    order: [ORDER_BY_DISPLAY_POSITION]
  },
  customParameters: {
    as: 'customParameters',
    model: ProductCustomParameterDbModel,
    separate: true,
    attributes: ['id', 'customParameter', 'displayPosition', 'isOrigin', 'language'],
    order: [ORDER_BY_DISPLAY_POSITION]
  },
  category: {
    as: 'categories',
    model: CategoryDbModel,
    through: {
      attributes: ['categoryId', 'productId']
    },
    attributes: ['id']
    // limit: 1, Cannot use due to a bug: https://github.com/sequelize/sequelize/issues/5806
  },
  categories: {
    as: 'categories',
    model: CategoryDbModel,
    through: {
      attributes: ['categoryId', 'productId']
    },
    attributes: ['id', 'categoryName', 'iconImage', 'displayPosition', 'isOrigin', 'language']
  },
  highlightPoints: {
    as: 'highlightPoints',
    model: HighlightPointDbModel,
    through: {
      attributes: []
    },
    attributes: ['id']
  },
  transparencies: {
    as: 'transparencies',
    model: ProductTransparencyDbModel,
    separate: true,
    attributes: [
      'id',
      'recycledMaterialDescription',
      'sdgsReport',
      'contributionDetails',
      'effect',
      'culturalProperty',
      'rarenessDescription',
      'isOrigin',
      'language'
    ]
  },
  locations: {
    as: 'locations',
    model: ProductLocationDbModel,
    separate: true,
    attributes: ['id', 'place', 'placeId', 'city', 'country', 'description', 'language', 'isOrigin']
  },
  producers: {
    as: 'producers',
    model: ProductProducerDbModel,
    separate: true,
    attributes: ['id', 'name', 'photo', 'comment', 'position', 'displayPosition', 'isOrigin', 'language'],
    order: [ORDER_BY_DISPLAY_POSITION]
  },
  regionalShippingFees: {
    as: 'regionalShippingFees',
    model: ProductRegionalShippingFeesDbModel,
    separate: true,
    attributes: ['id', 'prefectureCode', 'shippingFee'],
    where: {
      quantityRangeId: null
    }
  },
  parameterSets: {
    as: 'parameterSets',
    model: ProductParameterSetDbModel,
    separate: true,
    attributes: [
      'id',
      'colorId',
      'customParameterId',
      'price',
      'stock',
      'shipLaterStock',
      'purchasedNumber',
      'enable',
      'platformPercents',
      'cashbackCoinRate'
    ],
    include: [{ model: ProductParameterSetImageDbModel, as: 'images', separate: true, attributes: ['id', 'imagePath'] }]
  }
};

export const PRODUCT_CLONING_MODELS = {
  contentsClone: {
    ...PRODUCT_RELATED_MODELS.contents,
    attributes: ['title', 'subTitle', 'description', 'annotation', 'isOrigin', 'language']
  },
  imagesClone: {
    ...PRODUCT_RELATED_MODELS.images,
    attributes: ['imagePath', 'imageDescription', 'isOrigin', 'language']
  },
  storiesClone: {
    ...PRODUCT_RELATED_MODELS.stories,
    attributes: ['content', 'summaryContent', 'plainTextContent', 'plainTextSummaryContent', 'isOrigin', 'language']
  },
  materialsClone: {
    ...PRODUCT_RELATED_MODELS.materials,
    attributes: ['material', 'percent', 'displayPosition', 'isOrigin', 'language']
  },
  colorsClone: {
    ...PRODUCT_RELATED_MODELS.colors,
    attributes: ['id', 'color', 'displayPosition', 'isOrigin', 'language']
  },
  patternsClone: {
    ...PRODUCT_RELATED_MODELS.patterns,
    attributes: ['pattern', 'displayPosition', 'isOrigin', 'language']
  },
  customParametersClone: {
    ...PRODUCT_RELATED_MODELS.customParameters,
    attributes: ['id', 'customParameter', 'displayPosition', 'isOrigin', 'language']
  },
  highlightPointsClone: {
    ...PRODUCT_RELATED_MODELS.highlightPoints
  },
  transparenciesClone: {
    ...PRODUCT_RELATED_MODELS.transparencies,
    attributes: [
      'recycledMaterialDescription',
      'plainTextRecycledMaterialDescription',
      'sdgsReport',
      'plainTextSdgsReport',
      'contributionDetails',
      'plainTextContributionDetails',
      'effect',
      'plainTextEffect',
      'culturalProperty',
      'plainTextCulturalProperty',
      'rarenessDescription',
      'isOrigin',
      'language'
    ]
  },
  locationsClone: {
    ...PRODUCT_RELATED_MODELS.locations,
    attributes: ['place', 'placeId', 'city', 'country', 'description', 'language', 'isOrigin']
  },
  producersClone: {
    ...PRODUCT_RELATED_MODELS.producers,
    attributes: ['name', 'photo', 'comment', 'position', 'displayPosition', 'isOrigin', 'language']
  },
  regionalShippingFeesClone: {
    ...PRODUCT_RELATED_MODELS.regionalShippingFees,
    attributes: ['prefectureCode', 'shippingFee']
  },
  shippingFeesClone: {
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
  },
  parameterSetsClone: {
    ...PRODUCT_RELATED_MODELS.parameterSets,
    attributes: ['colorId', 'customParameterId', 'price', 'stock', 'shipLaterStock', 'enable'],
    include: [
      { model: ProductParameterSetImageDbModel, as: 'images', separate: true, attributes: ['imagePath'] },
      {
        as: 'productColor',
        model: ProductColorDbModel,
        attributes: ['id', 'color']
      },
      {
        as: 'productCustomParameter',
        model: ProductCustomParameterDbModel,
        attributes: ['id', 'customParameter']
      }
    ]
  },
  categoriesClone: {
    ...PRODUCT_RELATED_MODELS.categories,
    attributes: ['id']
  }
};

export const PRODUCT_ORDER_MODELS = {
  materialsASC: [
    {
      as: 'materials',
      model: ProductMaterialDbModel
    },
    'displayPosition',
    'ASC'
  ] as OrderItem,
  colorsASC: [
    {
      as: 'colors',
      model: ProductColorDbModel
    },
    'displayPosition',
    'ASC'
  ] as OrderItem,
  patternsASC: [
    {
      as: 'patterns',
      model: ProductPatternDbModel
    },
    'displayPosition',
    'ASC'
  ] as OrderItem,
  customParametersASC: [
    {
      as: 'customParameters',
      model: ProductCustomParameterDbModel
    },
    'displayPosition',
    'ASC'
  ] as OrderItem,
  categoriesASC: [
    {
      as: 'categories',
      model: CategoryDbModel
    },
    'displayPosition',
    'ASC'
  ] as OrderItem,
  producersASC: [
    {
      as: 'producers',
      model: ProductProducerDbModel
    },
    'displayPosition',
    'ASC'
  ] as OrderItem,
  imagesASC: [{ as: 'images', model: ProductImageDbModel }, 'displayPosition', 'ASC'] as OrderItem
};

export const PRODUCT_STATUS_ORDER_MODEL = {
  STATUS_ASC: `FIELD(product.status, 'draft','unpublished', 'published')`,
  STATUS_DESC: `FIELD(product.status, 'published','unpublished', 'draft')`
};

export const PRODUCT_FIELDS = {
  PRODUCT_ID: 'id',
  TRANSPARENCY_LEVEL: 'transparencyLevel',
  RARENESS_LEVEL: 'rarenessLevel',
  ETHICAL_LEVEL: 'ethicalLevel',
  PUBLISHED_AT: 'publishedAt',
  UPDATED_AT: 'updatedAt',
  PRICE: 'price',
  PURCHASED_NUMBER: 'purchasedNumber',
  STOCK: 'stock',
  STATUS: 'status',
  DISPLAY_POSITION: 'displayPosition',
  CREATED_AT: 'createdAt'
};
export const SEARCH_PARAMETER_MAPPING: IMapping = {
  stock: PRODUCT_FIELDS.STOCK,
  price: PRODUCT_FIELDS.PRICE,
  publish: PRODUCT_FIELDS.PUBLISHED_AT,
  mostpurchases: PRODUCT_FIELDS.PURCHASED_NUMBER,
  asc: ORDER.ASC,
  desc: ORDER.DESC,
  status: PRODUCT_FIELDS.STATUS,
  'popularity,mostpurchases': 'mostpurchases,desc'
};

export const SORT_SEARCH_RESULT_PARAMETERS_MATCHING_REGEX = /[a-zA-Z]+,[a-zA-Z]+/g;

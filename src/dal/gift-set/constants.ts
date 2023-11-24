import {
  AmbassadorDbModel,
  GiftSetContentDbModel,
  GiftSetProductContentDbModel,
  GiftSetProductDbModel,
  IAmbassadorModel,
  IGiftSetContentModel,
  IGiftSetProductContentModel,
  IGiftSetProductModel,
  IProductModel,
  IShopContentModel,
  IShopModel,
  KeysArrayOf,
  ProductDbModel,
  ProductStatusEnum,
  ShopContentDbModel,
  ShopDbModel
} from '../../database';
import { AMBASSADOR_RELATED_MODELS } from '../ambassador/constants';
import { PRODUCT_RELATED_MODELS } from '../product/constants';

import { IGiftSetMapping } from './interfaces';

const { contents: ambassadorContents, images: ambassadorImages } = AMBASSADOR_RELATED_MODELS;
const {
  contents: productContents,
  images: productImages,
  colors: productColors,
  customParameters: productCustomParameters,
  parameterSets: productParameterSets,
  highlightPoints: productHighlightPoints,
  categories: productCategories
} = PRODUCT_RELATED_MODELS;

export const ORDER = {
  DESC: 'DESC',
  ASC: 'ASC'
};
export const ORDER_BY_DISPLAY_ORDER = ['order', 'ASC'];

export const GIFT_SET_RELATED_MODELS = {
  contents: {
    as: 'contents',
    model: GiftSetContentDbModel,
    separate: true,
    attributes: ['id', 'title', 'description', 'ambassadorComment', 'isOrigin', 'language'] as KeysArrayOf<IGiftSetContentModel>
  },
  giftSetProducts: {
    as: 'giftSetProducts',
    model: GiftSetProductDbModel,
    include: [
      {
        as: 'contents',
        model: GiftSetProductContentDbModel,
        attributes: ['id', 'ambassadorComment', 'isOrigin', 'language'] as KeysArrayOf<IGiftSetProductContentModel>
      },
      {
        as: 'product',
        model: ProductDbModel,
        where: { status: ProductStatusEnum.PUBLISHED },
        include: [
          {
            ...productContents,
            attributes: ['id', 'title', 'annotation', 'isOrigin', 'language']
          },
          productImages,
          productColors,
          productCustomParameters,
          productParameterSets,
          productHighlightPoints,
          productCategories,
          {
            model: ShopDbModel,
            as: 'shop',
            include: [
              {
                as: 'contents',
                model: ShopContentDbModel,
                attributes: ['title', 'isOrigin', 'language'] as KeysArrayOf<IShopContentModel>
              }
            ],
            attributes: ['id', 'nameId'] as KeysArrayOf<IShopModel>
          }
        ],
        attributes: ['id', 'nameId', 'price', 'stock', 'ethicalLevel', 'transparencyLevel', 'status'] as KeysArrayOf<IProductModel>
      }
    ],
    attributes: ['id', 'giftSetId', 'productId', 'quantity', 'order'] as KeysArrayOf<IGiftSetProductModel>
  },
  ambassador: {
    as: 'ambassador',
    model: AmbassadorDbModel,
    include: [ambassadorContents, ambassadorImages],
    attributes: ['id', 'code', 'userId', 'imagePath', 'audioPath', 'socialLinks'] as KeysArrayOf<IAmbassadorModel>
  }
};

export const GIFTSET_FIELDS = {
  ORDER: 'order',
  UPDATED_AT: 'updatedAt'
};

export const SEARCH_PARAMETER_MAPPING: IGiftSetMapping = {
  publish: GIFTSET_FIELDS.ORDER,
  asc: ORDER.ASC,
  desc: ORDER.DESC
};

export const SORT_SEARCH_RESULT_PARAMETERS_MATCHING_REGEX = /[a-zA-Z]+,[a-zA-Z]+/g;

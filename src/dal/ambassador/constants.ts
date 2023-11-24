import {
  AmbassadorContentDbModel,
  AmbassadorImageDbModel,
  CategoryDbModel,
  GiftSetDbModel,
  GiftSetProductDbModel,
  HighlightPointDbModel,
  IAmbassadorContentModel,
  IAmbassadorImageModel,
  IGiftSetModel,
  KeysArrayOf,
  ProductDbModel,
  ProductImageDbModel
} from '../../database';

import { IAmbassadorMapping } from './interfaces';

export const ORDER = {
  DESC: 'DESC',
  ASC: 'ASC'
};
export const ORDER_BY_DISPLAY_POSITION = ['position', 'ASC'];

export const AMBASSADOR_RELATED_MODELS = {
  contents: {
    as: 'contents',
    model: AmbassadorContentDbModel,
    separate: true,
    attributes: [
      'id',
      'name',
      'profession',
      'specializedFieldTitle',
      'specializedFieldSubTitle',
      'isOrigin',
      'language',
      'description'
    ] as KeysArrayOf<IAmbassadorContentModel>
  },
  images: {
    as: 'images',
    model: AmbassadorImageDbModel,
    separate: true,
    attributes: ['id', 'imagePath', 'imageDescription', 'isOrigin', 'language'] as KeysArrayOf<IAmbassadorImageModel>
  },
  highlightPoints: {
    as: 'highlightPoints',
    model: HighlightPointDbModel,
    through: {
      attributes: []
    },
    attributes: ['id', 'icon']
  },
  giftSets: {
    as: 'giftSets',
    model: GiftSetDbModel,
    include: [
      {
        as: 'giftSetProducts',
        model: GiftSetProductDbModel,
        include: [
          {
            as: 'product',
            model: ProductDbModel,
            include: [
              {
                as: 'images',
                model: ProductImageDbModel,
                attributes: ['id', 'image_path']
              },
              {
                as: 'categories',
                model: CategoryDbModel,
                through: {
                  attributes: []
                },
                attributes: ['id', 'category_name', 'icon_image']
              }
            ],
            attributes: ['id']
          }
        ],
        attributes: ['id', 'gift_set_id', 'order', 'product_id', 'quantity']
      }
    ],
    attributes: ['id', 'code', 'status', 'order', 'ambassadorId', 'ambassadorAudioPath'] as KeysArrayOf<IGiftSetModel>
  }
};

export const AMBASSADOR_FIELDS = {
  PUBLISHED_AT: 'publishedAt',
  UPDATED_AT: 'updatedAt'
};

export const SEARCH_PARAMETER_MAPPING: IAmbassadorMapping = {
  publish: AMBASSADOR_FIELDS.PUBLISHED_AT,
  asc: ORDER.ASC,
  desc: ORDER.DESC
};

export const SORT_SEARCH_RESULT_PARAMETERS_MATCHING_REGEX = /[a-zA-Z]+,[a-zA-Z]+/g;

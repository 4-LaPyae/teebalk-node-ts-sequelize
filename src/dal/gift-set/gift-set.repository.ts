import { FindAndCountOptions, Op, OrderItem, Sequelize, WhereOptions } from 'sequelize';
import { ISearchQuery } from 'src/controllers/gift/interfaces';

import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER } from '../../constants';
import {
  CategoryDbModel,
  GiftSetContentDbModel,
  GiftSetProductDbModel,
  HighlightPointDbModel,
  IGiftSetContentModel,
  IGiftSetProductModel,
  IProductModel,
  KeysArrayOf,
  ProductCategoryDbModel,
  ProductDbModel,
  ProductHighlightPointDbModel,
  ProductImageDbModel,
  ProductStatusEnum
} from '../../database';
import { GiftSetDbModel, IGiftSetModel } from '../../database/models';
import { BaseRepository, IFindAndCountResult, IRepository } from '../_base';

import {
  GIFT_SET_RELATED_MODELS,
  GIFTSET_FIELDS,
  ORDER,
  SEARCH_PARAMETER_MAPPING,
  SORT_SEARCH_RESULT_PARAMETERS_MATCHING_REGEX
} from './constants';
import { IExtendedGiftSet } from './interfaces';

const { contents, giftSetProducts, ambassador }: any = GIFT_SET_RELATED_MODELS;

export interface IGiftSetRepository extends IRepository<IExtendedGiftSet> {
  getOneDetail(where: WhereOptions): Promise<IExtendedGiftSet>;
  getOneDescription(where: WhereOptions): Promise<IExtendedGiftSet>;
  getOneAmbassadorAudioPathAfterPayment(where: WhereOptions): Promise<IExtendedGiftSet>;
  getOneGiftSetProducts(where: WhereOptions): Promise<IExtendedGiftSet>;
  getGiftSets(searchQuery: ISearchQuery): Promise<IFindAndCountResult<IExtendedGiftSet>>;
  getGiftSetsData(searchQuery: ISearchQuery, giftSetsId: string[]): Promise<IFindAndCountResult<IExtendedGiftSet>>;
}

export class GiftSetRepository extends BaseRepository<IExtendedGiftSet> implements IGiftSetRepository {
  constructor() {
    super(GiftSetDbModel);
  }

  getOneDetail(where: WhereOptions): Promise<IExtendedGiftSet> {
    return this.findOne({
      where,
      include: [contents, giftSetProducts, ambassador],
      attributes: ['id', 'code', 'ambassadorId', 'ambassadorAudioPath'] as KeysArrayOf<IGiftSetModel>
    });
  }

  getOneDescription(where: WhereOptions): Promise<IExtendedGiftSet> {
    return this.findOne({
      where,
      include: [
        {
          as: 'contents',
          model: GiftSetContentDbModel,
          attributes: ['description'] as KeysArrayOf<IGiftSetContentModel>
        }
      ],
      attributes: ['id'] as KeysArrayOf<IGiftSetModel>
    });
  }

  getOneAmbassadorAudioPathAfterPayment(where: WhereOptions): Promise<IExtendedGiftSet> {
    return this.findOne({
      where,
      include: [ambassador],
      attributes: ['id', 'code', 'ambassadorId', 'ambassadorAudioPathAfterPayment'] as KeysArrayOf<IGiftSetModel>
    });
  }

  getOneGiftSetProducts(where: WhereOptions): Promise<IExtendedGiftSet> {
    return this.findOne({
      where,
      include: [
        {
          as: 'giftSetProducts',
          model: GiftSetProductDbModel,
          attributes: ['id', 'giftSetId', 'productId', 'quantity', 'order'] as KeysArrayOf<IGiftSetProductModel>
        }
      ],
      attributes: ['id', 'code', 'ambassadorId'] as KeysArrayOf<IGiftSetModel>
    });
  }

  getGiftSets(searchQuery: ISearchQuery): Promise<IFindAndCountResult<IExtendedGiftSet>> {
    const findOptions = this.buildFindOption(searchQuery, []);
    return this.setQuery(searchQuery, findOptions);
  }

  getGiftSetsData(searchQuery: ISearchQuery, giftSetsId: string[]): Promise<IFindAndCountResult<IExtendedGiftSet>> {
    const findOptions = this.buildFindOption(searchQuery, giftSetsId);
    return this.setQuery(searchQuery, findOptions);
  }

  setQuery(searchQuery: ISearchQuery, findOptions: FindAndCountOptions): Promise<IFindAndCountResult<IExtendedGiftSet>> {
    const { searchText } = searchQuery;

    if (searchText) {
      const giftSetContentQuery = `(SELECT gift_set_id FROM ${GiftSetContentDbModel.tableName} where
        title like ${this.escape(`%${searchText}%`)} or
        description like ${this.escape(`%${searchText}%`)} or
        ambassador_comment like ${this.escape(`%${searchText}%`)})`;

      findOptions.where = {
        id: { [Op.in]: Sequelize.literal(giftSetContentQuery) }
      };
      return this.findAndCountAll(findOptions);
    }
    return this.findAndCountAll(findOptions);
  }

  private buildFindOption(searchQuery: ISearchQuery, giftSetIds: string[]): FindAndCountOptions {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER, sort, cId, hId } = searchQuery;
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
      orderBy.push([GIFTSET_FIELDS.ORDER, ORDER.ASC]);
    }

    let findOptions: FindAndCountOptions = {};

    if (giftSetIds.length > 0) {
      findOptions = {
        limit,
        offset,
        where: {
          id: giftSetIds,
          deleted_at: null
        },
        distinct: true,
        order: orderBy,
        include: [
          contents,
          ambassador,
          {
            as: 'giftSetProducts',
            model: GiftSetProductDbModel,
            required: true,
            include: [
              {
                as: 'product',
                model: ProductDbModel,
                right: true,
                required: false,
                include: [
                  {
                    as: 'categories',
                    model: CategoryDbModel,
                    through: {
                      attributes: ['categoryId', 'productId']
                    },
                    attributes: ['id', 'categoryName', 'iconImage', 'displayPosition', 'isOrigin', 'language']
                  },
                  {
                    as: 'highlightPoints',
                    model: HighlightPointDbModel,
                    through: {
                      attributes: []
                    },
                    attributes: ['id']
                  },
                  {
                    as: 'images',
                    model: ProductImageDbModel,
                  }
                ],
                attributes: ['id', 'nameId', 'price', 'stock', 'ethicalLevel', 'transparencyLevel', 'status'] as KeysArrayOf<IProductModel>
              }
            ],
            attributes: ['id', 'giftSetId', 'productId', 'quantity', 'order'] as KeysArrayOf<IGiftSetProductModel>
          },
        ]
      };
    } else {
      let productCategoryQuery: any = {
        as: 'productCategory',
        model: ProductCategoryDbModel,
      };

      let productHighlightPointQuery: any = {
        as: 'productHighlightPoint',
        model: ProductHighlightPointDbModel,
      };

      if (cId) {
        productCategoryQuery = {
          ...productCategoryQuery,
          required: true,
          ...cId && {
            where: {
              categoryId: cId
            }
          }
        };
      }

      if (hId) {
        productHighlightPointQuery = {
          ...productHighlightPointQuery,
          required: true,
          ...hId && {
            where: {
              highlightPointId: hId
            }
          }
        };
      }

      const productQuery = {
        as: 'product',
        model: ProductDbModel,
        required: false,
        attributes: ['id', 'nameId', 'price', 'stock', 'ethicalLevel', 'transparencyLevel', 'status'] as KeysArrayOf<IProductModel>,
        where: { status: ProductStatusEnum.PUBLISHED }
      };

      let giftSetQuery: any = {
        as: 'giftSetProducts',
        model: GiftSetProductDbModel,
        required: true,
        include: [
          productQuery,
          productCategoryQuery,
          productHighlightPointQuery
        ],
        attributes: ['id', 'giftSetId', 'productId', 'quantity', 'order'] as KeysArrayOf<IGiftSetProductModel>
      };

      findOptions = {
        limit,
        offset,
        where: {
          deleted_at: null
        },
        distinct: true,
        order: orderBy,
        include: [
          contents,
          giftSetQuery
        ]
      };
    }

    return findOptions;
  }
}

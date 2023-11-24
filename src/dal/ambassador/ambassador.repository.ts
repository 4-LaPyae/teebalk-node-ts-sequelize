import { FindAndCountOptions, Op, OrderItem, Sequelize, WhereOptions } from 'sequelize';

import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER } from '../../constants';
import { ISearchQuery } from '../../controllers/ambassador/interfaces';
import { CategoryDbModel, GiftSetDbModel, GiftSetProductDbModel, IGiftSetModel, KeysArrayOf, ProductCategoryDbModel, ProductDbModel, ProductImageDbModel, ProductStatusEnum } from '../../database';
import { AmbassadorContentDbModel, AmbassadorDbModel, IAmbassadorModel } from '../../database/models';
import { BaseRepository, IFindAndCountResult, IRepository } from '../_base';
import { GIFT_SET_RELATED_MODELS } from '../gift-set/constants';

import {
  AMBASSADOR_FIELDS,
  AMBASSADOR_RELATED_MODELS,
  ORDER,
  SEARCH_PARAMETER_MAPPING,
  SORT_SEARCH_RESULT_PARAMETERS_MATCHING_REGEX
} from './constants';
import { IExtendedAmbassador } from './interfaces';

const { contents, images, highlightPoints, giftSets } = AMBASSADOR_RELATED_MODELS;
const { contents: giftSetContents, giftSetProducts } = GIFT_SET_RELATED_MODELS;

export interface IAmbassadorRepository extends IRepository<IExtendedAmbassador> {
  getOneDetail(whereOptions: WhereOptions): Promise<IExtendedAmbassador>;

  getAmbassadors(searchQuery: ISearchQuery): Promise<IFindAndCountResult<IExtendedAmbassador>>;
  getAmbassadorData(searchQuery: ISearchQuery, ambassadorIds: string[]): Promise<IFindAndCountResult<IExtendedAmbassador>>;
}

export class AmbassadorRepository extends BaseRepository<IExtendedAmbassador> implements IAmbassadorRepository {
  constructor() {
    super(AmbassadorDbModel);
  }

  getOneDetail(where: WhereOptions): Promise<IExtendedAmbassador> {
    return this.findOne({
      where,
      include: [
        contents,
        images,
        highlightPoints,
        {
          ...giftSets,
          include: [giftSetContents, giftSetProducts]
        }
      ],
      attributes: ['id', 'code', 'userId', 'imagePath', 'audioPath', 'instagramProfileEmbed', 'socialLinks'] as KeysArrayOf<
        IAmbassadorModel
      >
    });
  }

  getAmbassadors(searchQuery: ISearchQuery): Promise<IFindAndCountResult<IExtendedAmbassador>> {
    const findOptions = this.buildFindOption(searchQuery, []);
    return this.setQuery(searchQuery, findOptions);
  }

  getAmbassadorData(searchQuery: ISearchQuery, ambassadorIds: string[]): Promise<IFindAndCountResult<IExtendedAmbassador>> {
    const findOptions = this.buildFindOption(searchQuery, ambassadorIds);
    return this.setQuery(searchQuery, findOptions);
  }

  setQuery(searchQuery: ISearchQuery, findOptions: FindAndCountOptions): Promise<IFindAndCountResult<IExtendedAmbassador>> {
    const { searchText } = searchQuery;

    if (searchText) {
      const ambassadorContentQuery = `(SELECT ambassador_id FROM ${AmbassadorContentDbModel.tableName} where
        name like ${this.escape(`%${searchText}%`)} or
        profession like ${this.escape(`%${searchText}%`)} or
        description like ${this.escape(`%${searchText}%`)})`;

      findOptions.where = {
        id: {
          [Op.in]: Sequelize.literal(ambassadorContentQuery)
        }
      };
      return this.findAndCountAll(findOptions);
    }
    return this.findAndCountAll(findOptions);
  }

  private buildFindOption(searchQuery: ISearchQuery, ambassadorIds: string[]): FindAndCountOptions {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER, cId, hId, sort } = searchQuery;
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
      orderBy.push([AMBASSADOR_FIELDS.PUBLISHED_AT, ORDER.DESC]);
    }

    let productCategoryQuery: any = {
      as: 'productCategory',
      model: ProductCategoryDbModel,
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

    let findOptions: FindAndCountOptions = {};

    if (ambassadorIds.length > 0) {
      findOptions = {
        limit,
        offset,
        where: { deleted_at: null },
        distinct: true,
        include: [
          contents,
          images,
          {
            as: 'giftSets',
            model: GiftSetDbModel,
            required: true,
            include: [
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
                    attributes: ['id','nameId', 'status'],
                    where: { status: ProductStatusEnum.PUBLISHED },
                  }
                ],
                attributes: ['id', 'gift_set_id', 'order', 'product_id', 'quantity']
              }
            ],
            attributes: ['id', 'code', 'status', 'order', 'ambassadorId', 'ambassadorAudioPath'] as KeysArrayOf<IGiftSetModel>
          },
          { ...highlightPoints, ...(hId && { where: { id: hId } }) }
        ],
        order: orderBy
      };
    } else {
      findOptions = {
        limit,
        offset,
        where: { deleted_at: null },
        distinct: true,
        include: [
          contents,
          images,
          {
            as: 'giftSets',
            model: GiftSetDbModel,
            include: [
              {
                as: 'giftSetProducts',
                model: GiftSetProductDbModel,
                include: [
                  productCategoryQuery
                ],
                attributes: ['id', 'gift_set_id', 'order', 'product_id', 'quantity']
              }
            ],
            attributes: ['id', 'code', 'status', 'order', 'ambassadorId', 'ambassadorAudioPath'] as KeysArrayOf<IGiftSetModel>
          },
          { ...highlightPoints, ...(hId && { where: { id: hId } }) }
        ],
        order: orderBy
      };
    }

    return findOptions;
  }
}

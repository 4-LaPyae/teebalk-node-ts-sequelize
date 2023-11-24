import { col, FindOptions, fn } from 'sequelize';

import { DEFAULT_TOP_GIFT_SETS_LIMIT } from '../../constants';
import { GIFT_SET_RELATED_MODELS } from '../../dal/gift-set/constants';
import { PRODUCT_RELATED_MODELS } from '../product/constants';
import { GiftSetDbModel, GiftSetProductContentDbModel, GiftSetProductDbModel, IGiftSetProductContentModel, IGiftSetProductModel, IProductModel, IShopContentModel, IShopModel, KeysArrayOf, ProductDbModel, ProductStatusEnum, ShopContentDbModel, ShopDbModel, TopGiftSetDbModel } from '../../database';
import { BaseRepository, IRepository } from '../_base';

import { ITopGiftSetDao } from './interfaces';

// const log = new Logger('DAL:GiftSetRepository');
const { contents, ambassador } = GIFT_SET_RELATED_MODELS;
const {
  contents: productContents,
  images: productImages,
  colors: productColors,
  customParameters: productCustomParameters,
  parameterSets: productParameterSets,
  highlightPoints: productHighlightPoints,
  categories: productCategories
} = PRODUCT_RELATED_MODELS;

export interface ITopGiftSetRepository extends IRepository<ITopGiftSetDao> {
  getTopList(options?: FindOptions): Promise<ITopGiftSetDao[]>;
}

export class TopGiftSetRepository extends BaseRepository<ITopGiftSetDao> implements ITopGiftSetRepository {
  constructor() {
    super(TopGiftSetDbModel);
  }

  getTopList(options?: FindOptions): Promise<ITopGiftSetDao[]> {
    return this.findAll({
      limit: DEFAULT_TOP_GIFT_SETS_LIMIT,
      offset: 0,
      order: [fn('isnull', col('topGiftSet.order')), ['order', 'ASC'], ['id', 'ASC']],
      ...options,
      where: { deleted_at: null },
      include: [
        {
          model: GiftSetDbModel,
          as: 'giftSet',
          required: true,
          attributes: ['id', 'code', 'status', 'order', 'ambassadorId', 'ambassadorAudioPath'],
          include: [
            contents,
            {
              as: 'giftSetProducts',
              model: GiftSetProductDbModel,
              required: true,
              include: [
                {
                  as: 'contents',
                  model: GiftSetProductContentDbModel,
                  attributes: ['id', 'ambassadorComment', 'isOrigin', 'language'] as KeysArrayOf<IGiftSetProductContentModel>
                },
                {
                  as: 'product',
                  model: ProductDbModel,
                  right: true,
                  required: false,
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
            ambassador]
        }
      ],
      attributes: ['id', 'giftSetId', 'order']
    });
  }
}

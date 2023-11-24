import sequelize, { Op } from 'sequelize';
import { FindAndCountOptions, Transaction } from 'sequelize/types';

import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER } from '../../constants';
import { IInstoreOrderSortQuery } from '../../controllers/instore-order/interfaces';
import { IInstoreOrderGroupModel, KeysArrayOf } from '../../database';
import { InstoreOrderDbModel, InstoreOrderGroupDbModel } from '../../database/models';
import { BaseRepository, IFindAndCountResult, IRepository } from '../_base';

import { INSTORE_ORDER_FIELDS, INSTORE_ORDER_GROUP_RELATED_MODELS, INSTORE_ORDER_STATUS_SORT_MODEL, ORDER } from './constants';
import { IInstoreOrderGroupDao } from './interfaces';

const { orders, orderDetails } = INSTORE_ORDER_GROUP_RELATED_MODELS;

export interface IInstoreOrderGroupRepository extends IRepository<IInstoreOrderGroupDao> {
  getByNameId(nameId: string, transaction?: Transaction): Promise<IInstoreOrderGroupDao>;
  getByPaymentIntentId(paymentIntentId: string, transaction?: Transaction): Promise<IInstoreOrderGroupDao>;
  getAllInstoreOrders(
    shopId: number,
    userIds: number[] | null,
    optionsQuery: IInstoreOrderSortQuery,
    isShopMaster: boolean
  ): Promise<IFindAndCountResult<IInstoreOrderGroupDao>>;
}

export class InstoreOrderGroupRepository extends BaseRepository<IInstoreOrderGroupDao> implements IInstoreOrderGroupRepository {
  constructor() {
    super(InstoreOrderGroupDbModel);
  }

  getByNameId(nameId: string, transaction?: Transaction): Promise<IInstoreOrderGroupDao> {
    return this.findOne({
      where: { nameId },
      include: [orders, orderDetails],
      transaction
    });
  }

  getByPaymentIntentId(paymentIntentId: string, transaction?: Transaction): Promise<IInstoreOrderGroupDao> {
    return this.findOne({
      where: { paymentIntentId },
      include: [orders, orderDetails],
      transaction
    });
  }

  getAllInstoreOrders(
    shopId: number,
    userIds: number[] | null,
    optionsQuery: IInstoreOrderSortQuery,
    isShopMaster: boolean
  ): Promise<IFindAndCountResult<IInstoreOrderGroupDao>> {
    const findOptions = this.buildSortInstoreOrdersOption(shopId, userIds, optionsQuery, isShopMaster);
    return this.findAndCountAll(findOptions);
  }

  private buildSortInstoreOrdersOption(
    shopId: number,
    userIds: number[] | null,
    searchQuery: IInstoreOrderSortQuery,
    isShopMaster: boolean
  ): FindAndCountOptions {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER, searchText } = searchQuery;
    const offset = (pageNumber - 1) * limit;

    const instoreOrderQuery = `(SELECT DISTINCT order_group_id FROM ${InstoreOrderDbModel.tableName} WHERE shop_id = ${shopId})`;

    const instoreOrderOptions: FindAndCountOptions = {
      limit,
      offset,
      where: isShopMaster ? {} : { id: { [Op.in]: sequelize.literal(instoreOrderQuery) } },
      distinct: false,
      attributes: ['id', 'nameId', 'userId', 'sellerId', 'sellerType', 'totalAmount', 'status', 'code', 'updatedAt'] as KeysArrayOf<
        IInstoreOrderGroupModel
      >,
      order: [
        [sequelize.literal(INSTORE_ORDER_STATUS_SORT_MODEL.STATUS_DESC), ORDER.DESC],
        [INSTORE_ORDER_FIELDS.UPDATED_AT, ORDER.DESC]
      ],
      subQuery: false
    };

    if (searchText) {
      instoreOrderOptions.where = {
        ...instoreOrderOptions.where,
        [Op.or]: [{ userId: userIds }, { code: { [Op.like]: `%${searchText}%` } }]
      };
    }

    return instoreOrderOptions;
  }
}

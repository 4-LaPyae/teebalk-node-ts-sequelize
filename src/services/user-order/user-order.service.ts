import { LogMethodSignature } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import { QueryTypes, Sequelize } from 'sequelize';

import { DEFAULT_LIMIT, DEFAULT_PAGE_NUMBER, ItemTypeEnum } from '../../constants';
import { IUserOrderGroupList, IUserOrderPaginationOptions } from '../../controllers';
import { IInstoreOrderGroupRepository, IOrderGroupRepository } from '../../dal';
import {
  DataBaseTableNames,
  db,
  IInstoreOrderModel,
  InstoreOrderDbModel,
  InstoreOrderDetailDbModel,
  IOrderModel,
  KeysArrayOf,
  OrderDbModel,
  OrderDetailDbModel,
  OrderStatusEnum,
  ShopDbModel
} from '../../database';
import { getPaginationMetaData } from '../../helpers';
import { IExtendedInstoreOrderGroup } from '../instore-order';
import { IExtendedOrderGroup } from '../order';

const log = new Logger('SRV:PDFService');

export interface UserOrderServiceOptions {
  orderGroupRepository: IOrderGroupRepository;
  instoreOrderGroupRepository: IInstoreOrderGroupRepository;
}

export class UserOrderService {
  private services: UserOrderServiceOptions;
  private sequelize: Sequelize;

  constructor(services: UserOrderServiceOptions) {
    this.services = services;
    this.sequelize = db;
  }

  @LogMethodSignature(log)
  async getUserOrderGroupList(userId: number, options: IUserOrderPaginationOptions): Promise<IUserOrderGroupList> {
    const { limit = DEFAULT_LIMIT, pageNumber = DEFAULT_PAGE_NUMBER } = options || {};
    const offset = (pageNumber - 1) * limit;

    const [unionOrderGroupsTotalCountResult, unionOrderGroupsCurrentList] = await Promise.all([
      this.sequelize.query(
        // eslint-disable-next-line @typescript-eslint/tslint/config
        `
        SELECT count(x.id) as count
        FROM (
          SELECT id
          FROM ${DataBaseTableNames.ORDER_GROUP}
          WHERE user_id = ${userId} AND status = '${OrderStatusEnum.COMPLETED}'

          UNION ALL

          SELECT id
          FROM ${DataBaseTableNames.INSTORE_ORDER_GROUP}
          WHERE user_id = ${userId}
        ) as x
        ;
        `,
        { plain: true }
      ),
      // 'x.itemType' is needed here because we need to create a union of 'instore-order-groups' and 'order-groups' table.
      this.sequelize.query(
        // eslint-disable-next-line @typescript-eslint/tslint/config
        `
        SELECT x.id, x.itemType
        FROM (
          SELECT id, '${ItemTypeEnum.PRODUCT}' as itemType, created_at
          FROM ${DataBaseTableNames.ORDER_GROUP}
          WHERE user_id = ${userId} AND status = '${OrderStatusEnum.COMPLETED}'

          UNION ALL

          SELECT id, '${ItemTypeEnum.INSTORE_PRODUCT}' as itemType, created_at
          FROM ${DataBaseTableNames.INSTORE_ORDER_GROUP}
          WHERE user_id = ${userId}
        ) as x
        ORDER BY x.created_at DESC, x.id DESC
        LIMIT ${offset}, ${limit}
        ;
        `,
        { type: QueryTypes.SELECT }
      )
    ]);

    const unionOrderGroupsTotalCount = !unionOrderGroupsTotalCountResult ? 0 : (unionOrderGroupsTotalCountResult.count as number);

    // 'uog.itemType' is either only 'ItemTypeEnum.PRODUCT' or 'ItemTypeEnum.INSTORE_PRODUCT'. Does not contain any other itemType.
    const orderGroupIds = unionOrderGroupsCurrentList.filter((uog: any) => uog.itemType === ItemTypeEnum.PRODUCT).map((uog: any) => uog.id);
    const instoreOrderGroupIds = unionOrderGroupsCurrentList
      .filter((uog: any) => uog.itemType === ItemTypeEnum.INSTORE_PRODUCT)
      .map((uog: any) => uog.id);

    const [orderGroups, instoreOrderGroups] = await Promise.all([
      this.getOrderGroups(orderGroupIds),
      this.getInstoreOrderGroups(instoreOrderGroupIds)
    ]);

    // 'itemType' is needed in response because API for getting order details requires 'itemType' as parameter
    // in order to discern if the requested order is instore order or online order.
    const rows = unionOrderGroupsCurrentList.map(({ itemType, id: uogId }: any) => ({
      itemType,
      ...(itemType === ItemTypeEnum.INSTORE_PRODUCT
        ? instoreOrderGroups.find((iog: IExtendedInstoreOrderGroup) => iog.id === uogId)
        : orderGroups.find((og: IExtendedOrderGroup) => og.id === uogId))
    })) as (IExtendedOrderGroup | IExtendedInstoreOrderGroup)[];

    return {
      count: unionOrderGroupsTotalCount,
      rows,
      metadata: getPaginationMetaData({
        limit,
        pageNumber,
        count: unionOrderGroupsTotalCount
      })
    };
  }

  async getOrderGroups(id: number[]): Promise<IExtendedOrderGroup[]> {
    const orderGroups: IExtendedOrderGroup[] = (await this.services.orderGroupRepository.findAll({
      where: { id },
      include: [
        {
          as: 'orders',
          separate: true,
          model: OrderDbModel,
          attributes: ['id', 'code', 'productId', 'orderGroupId', 'status', 'totalAmount', 'orderedAt'] as KeysArrayOf<IOrderModel>,
          include: [
            {
              as: 'orderDetails',
              separate: true,
              model: OrderDetailDbModel,
              attributes: ['productId', 'productTitle', 'productImage']
            },
            {
              model: ShopDbModel,
              as: 'shop',
              attributes: ['id', 'nameId']
            }
          ]
        }
      ]
    })) as any;

    return orderGroups;
  }

  async getInstoreOrderGroups(id: number[]): Promise<IExtendedInstoreOrderGroup[]> {
    const instoreOrderGroups: IExtendedInstoreOrderGroup[] = (await this.services.instoreOrderGroupRepository.findAll({
      where: { id },
      include: [
        {
          as: 'orders',
          separate: true,
          model: InstoreOrderDbModel,
          attributes: ['id', 'code', 'orderGroupId', 'status', 'totalAmount'] as KeysArrayOf<IInstoreOrderModel>,
          include: [
            {
              as: 'orderDetails',
              separate: true,
              model: InstoreOrderDetailDbModel,
              attributes: ['productId', 'productTitle', 'productImage']
            },
            {
              model: ShopDbModel,
              as: 'shop',
              attributes: ['id', 'nameId']
            }
          ]
        }
      ]
    })) as any;

    return instoreOrderGroups;
  }
}

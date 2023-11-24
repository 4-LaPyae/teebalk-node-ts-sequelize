import { InstoreOrderDbModel, InstoreOrderDetailDbModel } from '../../database';

export const INSTORE_ORDER_GROUP_RELATED_MODELS = {
  orders: {
    as: 'orders',
    separate: true,
    model: InstoreOrderDbModel
  },
  orderDetails: {
    as: 'orderDetails',
    separate: true,
    model: InstoreOrderDetailDbModel
  }
};

export const INSTORE_ORDER_FIELDS = {
  UPDATED_AT: 'updatedAt'
};

export const ORDER = {
  DESC: 'DESC',
  ASC: 'ASC'
};

export const INSTORE_ORDER_STATUS_SORT_MODEL = {
  STATUS_DESC: `FIELD(instoreOrderGroup.status, 'completed', 'inProgress')`
};

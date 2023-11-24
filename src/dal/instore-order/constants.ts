import { ShopContentDbModel, ShopDbModel, ShopImageDbModel } from '../../database';

export const INSTORE_ORDER_RELATED_MODELS = {
  shop: {
    as: 'shop',
    model: ShopDbModel,
    attributes: ['id', 'nameId', 'userId', 'status', 'website', 'email', 'phone'],
    include: [
      {
        as: 'contents',
        model: ShopContentDbModel,
        attributes: ['title', 'subTitle', 'description', 'policy', 'isOrigin', 'language']
      },
      {
        as: 'images',
        model: ShopImageDbModel,
        attributes: ['id', 'imagePath', 'imageDescription', 'isOrigin', 'language']
      }
    ]
  }
};

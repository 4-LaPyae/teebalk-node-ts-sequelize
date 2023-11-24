import {
  ExperienceDbModel,
  ExperienceOrderDetailDbModel,
  ExperienceSessionTicketDbModel,
  ExperienceSessionTicketReservationDbModel,
  ShopContentDbModel,
  ShopDbModel,
  ShopImageDbModel
} from '../../database';
import { EXPERIENCE_RELATED_MODELS } from '../experience/constants';

const { contents, images } = EXPERIENCE_RELATED_MODELS;

export const EXPERIENCE_ORDER_RELATED_MODELS = {
  includeOrderDetails: [
    {
      model: ExperienceOrderDetailDbModel,
      as: 'orderDetails',
      separate: true,
      include: [
        {
          model: ExperienceSessionTicketReservationDbModel,
          as: 'reservations',
          separate: true
        },
        {
          model: ExperienceSessionTicketDbModel,
          as: 'ticket',
          attributes: [
            'id',
            'sessionId',
            'ticketId',
            'title',
            'description',
            'availableUntilMins',
            'locationCoordinate',
            'location',
            'locationPlaceId',
            'city',
            'country',
            'online',
            'offline',
            'eventLink',
            'eventPassword'
          ]
        },
        {
          model: ExperienceDbModel,
          as: 'experience',
          include: [contents, images],
          attributes: [
            'id',
            'nameId',
            'eventType',
            'quantity',
            'ethicalLevel',
            'transparencyLevel',
            'recycledMaterialPercent',
            'materialNaturePercent',
            'rarenessLevel',
            'rarenessTotalPoint',
            'sdgs',
            'categoryId'
          ]
        }
      ]
    },
    {
      model: ShopDbModel,
      as: 'shop',
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
  ]
};

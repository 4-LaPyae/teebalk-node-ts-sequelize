import {
  ExperienceDbModel,
  ExperienceSessionTicketDbModel,
  ExperienceSessionTicketReservationDbModel,
  ExperienceSessionTicketReservationLinkDbModel,
  ShopContentDbModel,
  ShopDbModel,
  ShopImageDbModel
} from '../../database';
import { EXPERIENCE_RELATED_MODELS } from '../experience/constants';

const { contents, images } = EXPERIENCE_RELATED_MODELS;

export const EXPERIENCE_ORDER_DETAIL_RELATED_MODELS = {
  includeReservations: {
    model: ExperienceSessionTicketReservationDbModel,
    as: 'reservations',
    separate: true,
    include: [
      {
        model: ExperienceSessionTicketReservationLinkDbModel,
        as: 'links',
        separate: true,
        where: {
          available: true
        }
      }
    ]
  },
  includeTicket: {
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
    ],
    paranoid: false
  },
  includeExperience: {
    model: ExperienceDbModel,
    as: 'experience',
    include: [
      contents,
      images,
      {
        model: ShopDbModel,
        as: 'shop',
        attributes: ['id', 'nameId', 'website', 'email', 'phone'],
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
    ],
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
      'categoryId',
      'locationCoordinate',
      'location',
      'locationPlaceId',
      'city',
      'country',
      'locationDescription'
    ],
    paranoid: false
  }
};

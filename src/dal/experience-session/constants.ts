import {
  ExperienceContentDbModel,
  ExperienceDbModel,
  ExperienceSessionTicketDbModel,
  ShopContentDbModel,
  ShopDbModel,
  ShopImageDbModel
} from '../../database';

export const EXPERIENCE_SESSION_RELATED_MODEL = {
  tickets: {
    model: ExperienceSessionTicketDbModel,
    as: 'tickets'
  },
  experience: {
    model: ExperienceDbModel,
    as: 'experience'
  },
  experienceReservationInfo: {
    model: ExperienceDbModel,
    as: 'experience',
    include: [
      {
        model: ExperienceContentDbModel,
        as: 'contents',
        separate: true,
        attributes: ['title', 'isOrigin', 'language'],
        paranoid: false
      },
      {
        model: ShopDbModel,
        as: 'shop',
        attributes: ['nameId'],
        include: [
          {
            as: 'contents',
            model: ShopContentDbModel,
            attributes: ['title', 'isOrigin', 'language'],
            paranoid: false
          },
          {
            as: 'images',
            model: ShopImageDbModel,
            attributes: ['imagePath'],
            paranoid: false
          }
        ],
        paranoid: false
      }
    ],
    attributes: ['id'],
    paranoid: false
  }
};

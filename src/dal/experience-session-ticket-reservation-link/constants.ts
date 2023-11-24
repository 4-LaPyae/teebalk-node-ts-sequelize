import {
  ExperienceContentDbModel,
  ExperienceDbModel,
  ExperienceImageDbModel,
  ExperienceOrderDetailDbModel,
  ExperienceSessionDbModel,
  ExperienceSessionTicketDbModel,
  ExperienceSessionTicketReservationDbModel
} from '../../database';

export const EXPERIENCE_SESSION_TICKET_RESERVATION_TYPE_RELATED_MODELS = {
  reservation: {
    model: ExperienceSessionTicketReservationDbModel,
    as: 'ticketReservation',
    include: [
      {
        as: 'orderDetail',
        model: ExperienceOrderDetailDbModel,
        paranoid: false,
        include: [
          {
            as: 'ticket',
            model: ExperienceSessionTicketDbModel,
            paranoid: false
          },
          {
            as: 'experience',
            model: ExperienceDbModel,
            paranoid: false,
            include: [
              {
                as: 'images',
                model: ExperienceImageDbModel,
                separate: true,
                attributes: ['id', 'imagePath', 'imageDescription', 'position'],
                order: [['position', 'ASC']]
              },
              {
                as: 'contents',
                model: ExperienceContentDbModel,
                attributes: ['title']
              }
            ]
          },
          {
            as: 'session',
            model: ExperienceSessionDbModel,
            paranoid: false
          }
        ]
      }
    ]
  }
};

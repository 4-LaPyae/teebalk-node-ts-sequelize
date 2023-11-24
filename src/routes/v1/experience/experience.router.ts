import { asyncWrapper, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Request, Router } from 'express';

import { ExperienceController } from '../../../controllers';
import {
  authTokenMiddleware,
  experienceAccessByNameIdMiddleware,
  experienceAccessMiddleware,
  experienceDeleteAvailableMiddleware,
  experienceEditAvailableMiddleware,
  experienceEditingAccessMiddleware,
  experienceLinkMiddleware,
  experienceOnlineEventLinkAvailableMiddleware,
  experiencePublishAvailableMiddleware,
  experienceSanitizeMiddleware,
  experienceSessionAvailableMiddleware,
  experienceUnpublishAvailableMiddleware,
  IRequestWithUser,
  isOwnCheckinTicketMiddleware,
  isOwnerTicketMiddleware,
  isSellerMiddleware,
  validationMiddleware
} from '../../../middlewares';
import {
  AssignLinkBodySchema,
  CheckinBodySchema,
  ExperienceEventDetailsSchema,
  ExperienceNameIdParameterSchema,
  ExperienceOnlineEventLinkSchema,
  ExperienceSessionTicketCodeParameterSchema,
  IdParameterSchema,
  LanguageQuerySchema,
  NewExperienceBodySchema,
  QuerySortWithLanguageSchema,
  TopExperienceTypeEnum,
  UpdateExperienceBodySchema
} from '../../../schemas';

export const experienceRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const controller: ExperienceController = serviceLocator.get('experienceController');
  router.get(
    '/all',
    authTokenMiddleware(serviceLocator.get('authService')),
    validationMiddleware({ query: QuerySortWithLanguageSchema }),
    asyncWrapper((req: IRequestWithUser) => controller.getAllExperiences(req.user.id, req.query))
  );

  router.get(
    '/top-experiences',
    validationMiddleware({ query: LanguageQuerySchema }),
    authTokenMiddleware(serviceLocator.get('authService'), true),
    asyncWrapper((req: IRequestWithUser) => controller.getTopList(TopExperienceTypeEnum.TOP_EXPERIENCE, req.query, req.user?.id))
  );

  router.get(
    '/reservations/upcoming',
    authTokenMiddleware(serviceLocator.get('authService')),
    asyncWrapper((req: IRequestWithUser) => controller.getUpcomingReservations(req.query, +req.user?.id))
  );

  router.get(
    '/reservations/completed',
    authTokenMiddleware(serviceLocator.get('authService')),
    asyncWrapper((req: IRequestWithUser) => controller.getCompletedReservations(req.query, +req.user?.id))
  );
  router.get(
    '/reservations/total',
    authTokenMiddleware(serviceLocator.get('authService')),
    asyncWrapper((req: IRequestWithUser) => controller.getReservationsTotal(+req.user?.id))
  );

  router.get(
    '/:nameId/save-card-campaign',
    validationMiddleware({ params: ExperienceNameIdParameterSchema, query: LanguageQuerySchema }),
    experienceAccessByNameIdMiddleware(serviceLocator.get('experienceService')),
    asyncWrapper((req: IRequestWithUser) => controller.getSaveCardCampaignByExperienceId(req.state.experience.id))
  );

  router.get(
    '/:nameId',
    validationMiddleware({ params: ExperienceNameIdParameterSchema, query: LanguageQuerySchema }),
    experienceAccessByNameIdMiddleware(serviceLocator.get('experienceService')),
    asyncWrapper((req: IRequestWithUser) => controller.getOneByNameId(req.params.nameId, req.query))
  );

  router.get(
    '/sessions/:sessionId(\\d+)',
    validationMiddleware({ params: ExperienceEventDetailsSchema, query: LanguageQuerySchema }),
    authTokenMiddleware(serviceLocator.get('authService')),
    asyncWrapper((req: IRequestWithUser) => controller.getExperienceSessionDetailReservation(+req.params.sessionId, req.query))
  );

  router.get(
    '/:nameId/:sessionId(\\d+)',
    experienceAccessByNameIdMiddleware(serviceLocator.get('experienceService')),
    authTokenMiddleware(serviceLocator.get('authService'), true),
    asyncWrapper((req: IRequestWithUser) =>
      controller.getExperienceSessionDetail(req.params.nameId, +req.params.sessionId, req.query, +req.user?.id)
    )
  );

  router.get(
    '/',
    validationMiddleware({ query: QuerySortWithLanguageSchema }),
    authTokenMiddleware(serviceLocator.get('authService'), true),
    asyncWrapper((req: IRequestWithUser) => controller.searchExperiences(req.query, req.user?.id))
  );

  router.post(
    '/reservations/validate-assign-link',
    authTokenMiddleware(serviceLocator.get('authService'), true),
    validationMiddleware({ body: AssignLinkBodySchema }),
    experienceLinkMiddleware(
      serviceLocator.get('experienceTicketReservationService'),
      serviceLocator.get('experienceService'),
      serviceLocator.get('experienceOrderService')
    ),
    asyncWrapper((req: IRequestWithUser) => req.state.assignLinkResult)
  );

  router.use(authTokenMiddleware(serviceLocator.get('authService')));

  router.post(
    '/add',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    experienceSanitizeMiddleware,
    validationMiddleware({ body: NewExperienceBodySchema }),
    asyncWrapper((req: IRequestWithUser) => controller.create(req.user.id, req.state.shop, req.body))
  );

  router.post(
    '/reservations/assign-link',
    validationMiddleware({ body: AssignLinkBodySchema }),
    experienceLinkMiddleware(
      serviceLocator.get('experienceTicketReservationService'),
      serviceLocator.get('experienceService'),
      serviceLocator.get('experienceOrderService')
    ),
    asyncWrapper((req: IRequestWithUser) => {
      if (req.state.assignLinkResult.error) {
        return req.state.assignLinkResult;
      }

      return controller.updateAssignedUserForTicketReservations(req.state.ticketReservationIds, req.user.id);
    })
  );

  router.get(
    '/:nameId/edit',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: ExperienceNameIdParameterSchema, query: LanguageQuerySchema }),
    experienceEditingAccessMiddleware(serviceLocator.get('experienceService')),
    asyncWrapper((req: Request) => controller.loadExperienceForEditing(req.params.nameId, req.query))
  );

  router.patch(
    '/:id',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    experienceSanitizeMiddleware,
    validationMiddleware({ params: IdParameterSchema, body: UpdateExperienceBodySchema }),
    experienceEditAvailableMiddleware(serviceLocator.get('experienceService')),
    experienceAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.update(req.state.experience.id, req.body))
  );

  router.patch(
    '/:id/publish',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema }),
    experiencePublishAvailableMiddleware(serviceLocator.get('experienceService')),
    experienceAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.publish(req.user.id, req.state?.experience))
  );

  router.patch(
    '/:id/unpublish',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema }),
    experienceUnpublishAvailableMiddleware(serviceLocator.get('experienceService')),
    experienceAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.unpublish(req.user.id, +req.params.id))
  );

  router.patch(
    '/:id/out-of-stock',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema }),
    experiencePublishAvailableMiddleware(serviceLocator.get('experienceService')),
    experienceAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.outOfStock(req.user.id, +req.params.id))
  );

  router.delete(
    '/:id',
    isSellerMiddleware(serviceLocator.get('shopRepository')),
    validationMiddleware({ params: IdParameterSchema }),
    experienceDeleteAvailableMiddleware(serviceLocator.get('experienceService')),
    experienceAccessMiddleware(),
    asyncWrapper((req: IRequestWithUser) => controller.delete(req.state.experience.id))
  );

  router.patch(
    '/reservations/check-in',
    experienceSanitizeMiddleware,
    validationMiddleware({ body: CheckinBodySchema }),
    isOwnCheckinTicketMiddleware(serviceLocator.get('experienceTicketReservationService')),
    asyncWrapper((req: IRequestWithUser) => controller.checkinTicket(req.user.id, req.body.answer, req.state.sessionTicketReservationIds))
  );

  router.patch(
    '/reservations/check-in/cancel',
    validationMiddleware({ body: CheckinBodySchema }),
    isOwnCheckinTicketMiddleware(serviceLocator.get('experienceTicketReservationService')),
    asyncWrapper((req: IRequestWithUser) => controller.cancelCheckinedTicket(req.state.sessionTicketReservationIds))
  );

  router.patch(
    '/reservations/:ticketCode/cancel',
    validationMiddleware({ params: ExperienceSessionTicketCodeParameterSchema }),
    isOwnerTicketMiddleware(serviceLocator.get('experienceTicketReservationService')),
    asyncWrapper((req: IRequestWithUser) => controller.cancelSharedTicket(req.state.sessionTicketReservationId))
  );

  router.get(
    '/:sessionId/:ticketCode/online-event-link',
    validationMiddleware({ params: ExperienceOnlineEventLinkSchema, query: LanguageQuerySchema }),
    experienceSessionAvailableMiddleware(serviceLocator.get('experienceService')),
    experienceOnlineEventLinkAvailableMiddleware(serviceLocator.get('experienceTicketReservationService')),
    asyncWrapper((req: IRequestWithUser) => controller.getExperienceOnlineEventLink(req.state.sessionTicket))
  );

  return router;
};

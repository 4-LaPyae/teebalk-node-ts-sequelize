import { asyncWrapper, RequestHeadersEnum, ServiceLocator } from '@freewilltokyo/freewill-be';
import { Router } from 'express';

import { ProjectController } from '../../../controllers';
import { authTokenMiddleware, IExtendedRequest, validationMiddleware } from '../../../middlewares';
import { getIdParameterSchema } from '../../../schemas';

export const projectsRouter = (serviceLocator: ServiceLocator) => {
  const router = Router();

  const projectController: ProjectController = serviceLocator.get('projectController');

  router.get(
    '/my',
    validationMiddleware({ params: getIdParameterSchema(['projectId', 'phaseId']) }),
    authTokenMiddleware(serviceLocator.get('authService')) as any,
    asyncWrapper((req: IExtendedRequest) =>
      projectController.getMyProjects({
        ...req.query,
        accessToken: req.get(RequestHeadersEnum.AUTHORIZATION)
      })
    )
  );

  router.get(
    '/:projectId/phases/:phaseId/reports',
    validationMiddleware({ params: getIdParameterSchema(['projectId', 'phaseId']) }),
    asyncWrapper((req: IExtendedRequest) =>
      projectController.getPhaseReports(+req.params.projectId, +req.params.phaseId, {
        ...req.query,
        accessToken: req.get(RequestHeadersEnum.AUTHORIZATION)
      })
    )
  );

  router.get(
    '/:projectId/phases/:phaseId/comments',
    validationMiddleware({ params: getIdParameterSchema(['projectId', 'phaseId']) }),
    asyncWrapper((req: IExtendedRequest) =>
      projectController.getPhaseComments(+req.params.projectId, +req.params.phaseId, {
        ...req.query,
        accessToken: req.get(RequestHeadersEnum.AUTHORIZATION)
      })
    )
  );

  router.get(
    '/:projectId/phases/:phaseId/reports/documents/:documentId',
    validationMiddleware({ params: getIdParameterSchema(['projectId', 'phaseId', 'documentId']) }),
    asyncWrapper((req: IExtendedRequest) =>
      projectController.getPhaseDocumentById(
        +req.params.projectId,
        +req.params.phaseId,
        +req.params.documentId,
        req.get(RequestHeadersEnum.AUTHORIZATION)
      )
    )
  );

  return router;
};

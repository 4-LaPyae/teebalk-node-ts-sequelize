import { ApiError, ISpinClient, LogMethodFail, LogMethodSignature } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';

import { BaseController } from '../_base';

export interface IProjectControllerServices {
  spinClient: ISpinClient;
}

const log = new Logger('CTR:ProjectController');

interface ISpinControllerMethodOptions {
  limit: number;
  offset: number;
  accessToken?: string;
}

export class ProjectController extends BaseController<IProjectControllerServices> {
  @LogMethodSignature(log)
  @LogMethodFail(log)
  async getOwnProjectsByUserExternalId(externalId: number, queryOptions: ISpinControllerMethodOptions) {
    if (!externalId) {
      throw ApiError.badRequest('Parameter "externalId" is required.');
    }

    const { id: spinLocalUserId } = await this.services.spinClient.getUserDetails(externalId);

    if (!spinLocalUserId) {
      throw ApiError.notFound('User not found');
    }

    const projects = await this.services.spinClient.getProjectsByUserId(spinLocalUserId, queryOptions);
    return projects;
  }

  @LogMethodSignature(log)
  @LogMethodFail(log)
  async getSupportedProjectsByUserExternalId(externalId: number, queryOptions: ISpinControllerMethodOptions) {
    if (!externalId) {
      throw ApiError.badRequest('Parameter "externalId" is required.');
    }

    const { id: spinLocalUserId } = await this.services.spinClient.getUserDetails(externalId);

    if (!spinLocalUserId) {
      throw ApiError.notFound('User not found');
    }

    const projects = await this.services.spinClient.getProjectsSupportedByUserId(spinLocalUserId, queryOptions);
    return projects;
  }

  @LogMethodSignature(log)
  @LogMethodFail(log)
  getPhaseComments(projectId: number, phaseId: number, options: ISpinControllerMethodOptions) {
    return this.services.spinClient.getPhaseComments(projectId, phaseId, options);
  }

  @LogMethodSignature(log)
  @LogMethodFail(log)
  getMyProjects(options: ISpinControllerMethodOptions) {
    return this.services.spinClient.getMyProjects(options);
  }

  @LogMethodSignature(log)
  @LogMethodFail(log)
  getPhaseReports(projectId: number, phaseId: number, options: ISpinControllerMethodOptions) {
    return this.services.spinClient.getPhaseReports(projectId, phaseId, options);
  }

  @LogMethodSignature(log)
  @LogMethodFail(log)
  getPhaseDocumentById(projectId: number, phaseId: number, documentId: number, accessToken?: string) {
    return this.services.spinClient.getPhaseDocumentById(projectId, phaseId, documentId, accessToken);
  }

  @LogMethodSignature(log)
  @LogMethodFail(log)
  getProjectDonations(projectId: number, options: ISpinControllerMethodOptions) {
    return this.services.spinClient.getProjectTransactions(projectId, options);
  }
}

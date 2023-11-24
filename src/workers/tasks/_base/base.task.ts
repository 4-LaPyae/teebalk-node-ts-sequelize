import { StripeService } from '../../../services/stripe';
import { TaskIdEnum } from '../../enums';

export interface IWorkerTaskServices {
  stripeService: StripeService;
}

export interface IWorkerTask {
  action: TaskIdEnum;
  exec(): Promise<any>;
}

export abstract class BaseWorkerTask {
  protected services: IWorkerTaskServices;
  abstract action: TaskIdEnum;

  constructor(services: any = {}) {
    this.services = services;
  }

  abstract exec(): Promise<void>;
}

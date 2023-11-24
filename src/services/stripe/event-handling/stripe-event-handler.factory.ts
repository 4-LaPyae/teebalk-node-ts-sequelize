import { ApiError } from '../../../errors';
import { StripeEventTypeEnum } from '../constants';

import { IStripeEventHandler } from './base';
import * as HandlerTypes from './handlers';
import { IStripeEventHandlerFactory, IStripeEventHandlerServices } from './interfaces';

export class StripeEventHandlerFactory implements IStripeEventHandlerFactory {
  private services: IStripeEventHandlerServices;

  constructor(services: IStripeEventHandlerServices) {
    this.services = services;
  }

  create(eventType: StripeEventTypeEnum) {
    const handler = Object.values(HandlerTypes).find(({ prototype }) => Object.is(prototype.eventType, eventType));

    if (handler === undefined) {
      throw ApiError.notFound(`Event handler for ${eventType} was not found!`);
    }

    const instance = Reflect.construct(handler, [this.services]);

    return instance as IStripeEventHandler;
  }
}

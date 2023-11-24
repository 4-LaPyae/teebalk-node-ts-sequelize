import { StripeEventTypeEnum } from '../constants';

import { IStripeEventHandler } from './base';
import { IStripeEventHandlerFactory, IStripeEventHandlerRegistry } from './interfaces';

export class StripeEventHandlerRegistry implements IStripeEventHandlerRegistry {
  private factory: IStripeEventHandlerFactory;

  private readonly registry = new Map<string, IStripeEventHandler>();

  constructor(factory: IStripeEventHandlerFactory) {
    this.factory = factory;
  }

  get(eventType: StripeEventTypeEnum) {
    if (!this.registry.has(eventType)) {
      const instance = this.factory.create(eventType);

      this.registry.set(eventType, instance);
    }

    return this.registry.get(eventType) as IStripeEventHandler;
  }
}

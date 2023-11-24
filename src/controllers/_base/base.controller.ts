// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IController {}

export abstract class BaseController<T> implements IController {
  protected readonly services: T;

  constructor(services?: any) {
    this.services = services as any;
  }
}

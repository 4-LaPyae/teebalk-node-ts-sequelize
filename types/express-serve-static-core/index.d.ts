import { Transaction } from 'sequelize';

declare module 'express-serve-static-core' {
  export type TransactionalDelegateParams = [Request, Response, TransactionalRequestHandler];

  // eslint-disable-next-line max-len
  export type TransactionalRequestHandler = <TRequest extends Request, TResponse extends Response>(
    req: TRequest,
    res: TResponse,
    transaction: Transaction
  ) => any;

  // export type IRouterMatcher<T> = (path: PathParams, ...handlers: (RequestHandlerParams | TransactionalRequestHandler)[]) => T;
}

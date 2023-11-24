import { createTransaction } from './create.transaction';

export function Transactional(target: any, key: any, descriptor: any) {
  if (!descriptor) {
    throw new Error('Cannot get property descriptor!');
  }

  const method = descriptor.value;
  if (typeof method !== 'function') {
    throw new Error('Only function types supported!');
  }

  return {
    ...descriptor,
    async value(...args: any[]) {
      const transaction = await createTransaction();

      // just for avoiding Circular dependency error when it appears in logs
      (transaction as any).toJSON = () => ({ transaction: 'transaction' });

      try {
        const result: any = await method.call(this, ...args, transaction);
        await transaction.commit();
        return result;
      } catch (e) {
        await transaction.rollback();
        throw e;
      }
    }
  };
}

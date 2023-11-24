import { createTransaction } from './create.transaction';

export const baseTransactionWrapper = (method: any) => async (...args: any): Promise<void> => {
  const transaction = await createTransaction();

  try {
    await method(...args, transaction);
    await transaction.commit();
  } catch (e) {
    await transaction.rollback();

    throw e;
  }
};

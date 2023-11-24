import Logger from '@freewilltokyo/logger';
import { QueryOptions, Transaction } from 'sequelize';

import { createTransaction } from './create.transaction';

const log = new Logger('Migration');

export const migrationWrapper = async (method: (options: QueryOptions) => Promise<void>): Promise<void> => {
  const transaction: Transaction = await createTransaction();
  const options = { raw: true, transaction };

  try {
    await method(options);
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    log.error(err);
    throw err;
  }
};

import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

/**
 * User stripe statuses were defining based on analogy on stripe dashboard, cuz there present same labels (restricted, enabled, completed)
 * Look at https://dashboard.stripe.com/test/connect/accounts/overview.
 */

// TODO: move to library
export enum UserStripeStatusEnum {
  RESTRICTED = 'restricted',
  ENABLED = 'enabled',
  COMPLETED = 'completed',
  PENDING = 'pending',
  VERIFICATION_FAILED = 'verification_failed',
  REJECTED = 'rejected',
  REQUIRES_IDENTITY_DOC = 'requires_identity_doc', // requires identification documents
  PENDING_VERIFICATION = 'pending_verification'
}

export interface IUserStripeModel {
  userId: number;
  customerId: string;
  accountId: string;
  bankAccountId: string;
  status: UserStripeStatusEnum; // status of connected account
  createdAt: string;
  updatedAt: string;
}

const modelAttributes: DbModelFieldInit<Partial<IUserStripeModel>> = {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true
  },
  customerId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accountId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankAccountId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM,
    values: Object.values(UserStripeStatusEnum),
    allowNull: true,
    defaultValue: null
  }
};

@AssociativeModel
export class UserStripeDbModel extends Model {
  // static associate({
  //   // eslint-disable-next-line @typescript-eslint/tslint/config
  // }: any) {}
}

UserStripeDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.USER_STRIPE,
  tableName: DataBaseTableNames.USER_STRIPE,
  timestamps: true,
  underscored: true
});

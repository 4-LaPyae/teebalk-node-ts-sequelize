import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { DataBaseModelNames, DataBaseTableNames } from '../constants';
import { DbModelFieldInit } from '../db-structure.model';
import { db } from '../db.provider';

import { AssociativeModel } from './_model.decorator';

export interface ITopExperienceModel {
  experienceId: number;
}

const modelAttributes: DbModelFieldInit<Partial<ITopExperienceModel>> = {
  experienceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
};

@AssociativeModel
export class TopExperienceDbModel extends Model {
  static associate({
    // eslint-disable-next-line @typescript-eslint/tslint/config
    ExperienceDbModel
  }: any) {
    this.belongsTo(ExperienceDbModel, { foreignKey: 'experienceId', as: 'experience' });
  }
}

TopExperienceDbModel.init(modelAttributes as ModelAttributes, {
  sequelize: db,
  modelName: DataBaseModelNames.TOP_EXPERIENCE,
  tableName: DataBaseTableNames.TOP_EXPERIENCE,
  timestamps: true,
  paranoid: true,
  underscored: true
});

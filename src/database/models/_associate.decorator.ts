enum DdModelNameEnum {
  UserDbModel
}

export type IDbModelMap = {
  [key in keyof typeof DdModelNameEnum]: any;
};

const models: any = {};

const _associateDecorator = (target: any) => {
  if (!target) {
    throw new Error('Cannot get property target!');
  }

  models[target.name] = target;

  return target;
};

export const associative = _associateDecorator;

export const processAssociations = () => {
  Object.values(models).forEach((model: any) => {
    if (model.associate && typeof model.associate === 'function') {
      model.associate(models as IDbModelMap);
    }
  });
};

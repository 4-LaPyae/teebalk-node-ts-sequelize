import { Op } from 'sequelize';
import { QueryInterface } from 'sequelize';

import { ProductInventoryDbModel } from '../../database';
import { IProductInventoryModel, ProductDbModel } from '../models';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const productInventories: IProductInventoryModel[] = (await ProductInventoryDbModel.findAll({
        where: {
          inStocks: { [Op.ne]: null } as any
        }
      })) as any;

      for (const productInventory of productInventories) {
        await ProductDbModel.update(
          { stock: productInventory.inStocks },
          {
            where: { id: productInventory.productId },
            transaction
          }
        );
      }
    });
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {}
};

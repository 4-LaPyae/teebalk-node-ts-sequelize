import { QueryInterface } from 'sequelize';

import { CategoryDbModel } from '../models';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.sequelize.transaction(async t => {
      const LIMIT = 7;
      const categories = await CategoryDbModel.findAll({
        attributes: ['id'],
        order: [['id', 'ASC']],
        limit: LIMIT
      });
      const updateRequests: any[] = [];
      const newCategoryNames = [
        {
          name: 'Fashion'
        },
        {
          name: 'Accessories'
        },
        {
          name: 'HomeSupplies'
        },
        {
          name: 'Kitchenware'
        },
        {
          name: 'Furniture'
        },
        {
          name: 'Electronics'
        },
        {
          name: 'OfficeSupplies'
        }
      ];
      categories.forEach(({ id }: any, key: number) => {
        updateRequests.push(
          CategoryDbModel.update(
            {
              categoryName: newCategoryNames[key].name
            },
            {
              where: {
                id
              },
              transaction: t
            }
          )
        );
      });

      return Promise.all(updateRequests);
    });
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {}
};

import { QueryInterface } from 'sequelize';

import { CategoryImageDbModel } from '../models';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.sequelize.transaction(transaction => {
      return Promise.all(
        [
          {
            id: 1,
            imagePath: 'https://assets.tells-market.com/images/tells/product-categories/fashion.png'
          },
          {
            id: 2,
            imagePath: 'https://assets.tells-market.com/images/tells/product-categories/accessories.png'
          },
          {
            id: 3,
            imagePath: 'https://assets.tells-market.com/images/tells/product-categories/homesupplies.png'
          },
          {
            id: 4,
            imagePath: 'https://assets.tells-market.com/images/tells/product-categories/kitchenware.png'
          },
          {
            id: 5,
            imagePath: 'https://assets.tells-market.com/images/tells/product-categories/furniture.png'
          },
          {
            id: 6,
            imagePath: 'https://assets.tells-market.com/images/tells/product-categories/electronics.png'
          },
          {
            id: 7,
            imagePath: 'https://assets.tells-market.com/images/tells/product-categories/officesupplies.png'
          },
          {
            id: 8,
            imagePath: 'https://assets.tells-market.com/images/tells/product-categories/beautyhealth.png'
          },
          {
            id: 9,
            imagePath: 'https://assets.tells-market.com/images/tells/product-categories/hobby.png'
          },
          {
            id: 10,
            imagePath: 'https://assets.tells-market.com/images/tells/product-categories/foodbeveragealcohol.png'
          },
          {
            id: 11,
            imagePath: 'https://assets.tells-market.com/images/tells/product-categories/babykidstoys.png'
          },
          {
            id: 12,
            imagePath: 'https://assets.tells-market.com/images/tells/product-categories/householdsupplies.png'
          }
        ].map(({ id, ...data }) => CategoryImageDbModel.update(data, { where: { id }, transaction }))
      );
    });
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {}
};

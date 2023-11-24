import { QueryInterface } from 'sequelize';

import { HighlightPointDbModel } from '../models';

export default {
  up: (queryInterface: QueryInterface) => {
    /* eslint-disable require-await */
    return queryInterface.sequelize.transaction(async transaction => {
      return Promise.all(
        [
          {
            id: 1,
            icon: '/assets/icons/product-highlights/cultures-and-tradition.svg'
          },
          {
            id: 2,
            icon: '/assets/icons/product-highlights/love-for-local-communities.svg'
          },
          {
            id: 3,
            icon: '/assets/icons/product-highlights/produced-with-love.svg'
          },
          {
            id: 4,
            icon: '/assets/icons/product-highlights/natural-materials-and-organic-products.svg'
          },
          {
            id: 5,
            icon: '/assets/icons/product-highlights/love-for-animals.svg'
          },
          {
            id: 6,
            icon: '/assets/icons/product-highlights/protects-the-ocean.svg'
          },
          {
            id: 7,
            icon: '/assets/icons/product-highlights/protects-the-forrests.svg'
          },
          {
            id: 8,
            icon: '/assets/icons/product-highlights/recycle-and-upcycle.svg'
          },
          {
            id: 9,
            icon: '/assets/icons/product-highlights/artisanship.svg'
          },
          {
            id: 10,
            icon: '/assets/icons/product-highlights/hand-made.svg'
          },
          {
            id: 11,
            icon: '/assets/icons/product-highlights/limited-items.svg'
          },
          {
            id: 12,
            icon: '/assets/icons/product-highlights/lack-of-successors.svg'
          },
          {
            id: 13,
            icon: '/assets/icons/product-highlights/limited-resources.svg'
          },
          {
            id: 14,
            icon: '/assets/icons/product-highlights/rare-materials.svg'
          },
          {
            id: 15,
            icon: '/assets/icons/product-highlights/lack-of-hands.svg'
          },
          {
            id: 16,
            icon: '/assets/icons/product-highlights/hidden-gem.svg'
          }
        ].map(({ id, icon }) => HighlightPointDbModel.update({ icon }, { where: { id }, transaction }))
      );
    });
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {}
};

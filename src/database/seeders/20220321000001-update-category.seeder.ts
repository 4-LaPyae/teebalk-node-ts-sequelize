import { QueryInterface } from 'sequelize';

import { CategoryDbModel, CategoryImageDbModel } from '../models';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.sequelize.transaction(t => {
      const cateActions: any[] = [];
      const catesUpdated = [
        {
          id: 8,
          categoryName: 'BeautyHealth',
          imagePath: '/assets/images/categories/beautyhealth.png',
          iconImage: '/assets/icons/categories/beautyhealth.svg'
        },
        {
          id: 9,
          categoryName: 'Hobby',
          imagePath: '/assets/images/categories/hobby.png',
          iconImage: '/assets/icons/categories/hobby.svg'
        },
        {
          id: 10,
          categoryName: 'FoodBeverageAlcohol',
          imagePath: '/assets/images/categories/foodbeveragealcohol.png',
          iconImage: '/assets/icons/categories/foodbeveragealcohol.svg'
        },
        {
          id: 11,
          categoryName: 'BabyKidsToys',
          imagePath: '/assets/images/categories/babykidstoys.png',
          iconImage: '/assets/icons/categories/babykidstoys.svg'
        },
        {
          id: 12,
          categoryName: 'HouseholdSupplies',
          imagePath: '/assets/images/categories/householdsupplies.png',
          iconImage: '/assets/icons/categories/householdsupplies.svg'
        }
      ];
      catesUpdated.forEach(({ id, categoryName, iconImage, imagePath }: any) => {
        // Update new name, icon in category table
        cateActions.push(
          CategoryDbModel.restore({
            where: {
              id
            },
            transaction: t
          })
        );
        cateActions.push(
          CategoryDbModel.update(
            {
              categoryName,
              iconImage
            },
            {
              where: {
                id
              },
              transaction: t
            }
          )
        );

        // Update new imagePath in category_images table
        cateActions.push(
          CategoryImageDbModel.restore({
            where: {
              id
            },
            transaction: t
          })
        );
        cateActions.push(
          CategoryImageDbModel.update(
            {
              imagePath
            },
            {
              where: {
                categoryId: id
              },
              transaction: t
            }
          )
        );
      });

      return Promise.all(cateActions);
    });
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {}
};

import { Op, QueryInterface } from 'sequelize';

import { CategoryDbModel, CategoryImageDbModel, ProductCategoryDbModel } from '../models';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.sequelize.transaction(async t => {
      const LIMIT = 7;
      const categories = await CategoryDbModel.findAll({
        attributes: ['id'],
        order: [['id', 'ASC']],
        limit: LIMIT
      });
      const categoryIds: number[] = [];
      const cateActions: any[] = [];
      const catesUpdated = [
        {
          name: 'ファッション',
          imagePath: '/assets/images/categories/fashion.png',
          iconImage: '/assets/icons/categories/fashion.svg'
        },
        {
          name: 'アクセサリー',
          imagePath: '/assets/images/categories/accessories.png',
          iconImage: '/assets/icons/categories/accessories.svg'
        },
        {
          name: '生活雑貨',
          imagePath: '/assets/images/categories/homesupplies.png',
          iconImage: '/assets/icons/categories/homesupplies.svg'
        },
        {
          name: 'キッチン ＆ ダイニング',
          imagePath: '/assets/images/categories/kitchenware.png',
          iconImage: '/assets/icons/categories/kitchenware.svg'
        },
        {
          name: 'インテリア',
          imagePath: '/assets/images/categories/furniture.png',
          iconImage: '/assets/icons/categories/furniture.svg'
        },
        {
          name: '電子機器',
          imagePath: '/assets/images/categories/electronics.png',
          iconImage: '/assets/icons/categories/electronics.svg'
        },
        {
          name: '文房具',
          imagePath: '/assets/images/categories/officesupplies.png',
          iconImage: '/assets/icons/categories/officesupplies.svg'
        }
      ];
      categories.forEach(({ id }: any, key: number) => {
        categoryIds.push(id);

        // Update new name, icon in category table
        cateActions.push(
          CategoryDbModel.update(
            {
              categoryName: catesUpdated[key].name,
              iconImage: catesUpdated[key].iconImage
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
          CategoryImageDbModel.update(
            {
              imagePath: catesUpdated[key].imagePath
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

      if (categoryIds.length) {
        // The new list has 7 items.
        // Therefore all products with a category not in that list will be updated to be linked with the first category.
        const firstCategoryId = categoryIds[0];
        cateActions.push(
          ProductCategoryDbModel.update(
            {
              categoryId: firstCategoryId
            },
            {
              where: {
                categoryId: {
                  [Op.notIn]: categoryIds
                }
              },
              transaction: t
            }
          )
        );

        // Remove categories don't use
        cateActions.push(
          CategoryDbModel.destroy({
            individualHooks: true,
            where: {
              id: {
                [Op.notIn]: categoryIds
              }
            },
            transaction: t
          })
        );

        // Remove category images don't use
        cateActions.push(
          CategoryImageDbModel.destroy({
            individualHooks: true,
            where: {
              categoryId: {
                [Op.notIn]: categoryIds
              }
            },
            transaction: t
          })
        );
      }

      return Promise.all(cateActions);
    });
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {}
};

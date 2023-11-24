import { QueryInterface } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.bulkInsert(
      DataBaseTableNames.CATEGORY,
      [
        {
          category_name: 'Recycled Artworks',
          icon_image: '/assets/icons/recycle_icon.svg',
          display_position: 0,
          is_origin: 1,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_name: 'Plants',
          icon_image: '/assets/icons/plants_icon.svg',
          display_position: 1,
          is_origin: 1,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_name: 'Organic Food',
          icon_image: '/assets/icons/organicfood_icon.svg',
          display_position: 2,
          is_origin: 1,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_name: 'Pottery',
          icon_image: '/assets/icons/pottery_icon.svg',
          display_position: 3,
          is_origin: 1,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_name: 'Accessories',
          icon_image: '/assets/icons/accessories_icon.svg',
          display_position: 4,
          is_origin: 1,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_name: 'Wood',
          icon_image: '/assets/icons/wood_icon.svg',
          display_position: 5,
          is_origin: 1,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_name: 'Recycled Artworks',
          icon_image: '/assets/icons/recycle_icon.svg',
          display_position: 6,
          is_origin: 1,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_name: 'Plants',
          icon_image: '/assets/icons/plants_icon.svg',
          display_position: 7,
          is_origin: 1,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_name: 'Organic Food',
          icon_image: '/assets/icons/organicfood_icon.svg',
          display_position: 8,
          is_origin: 1,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_name: 'Pottery',
          icon_image: '/assets/icons/pottery_icon.svg',
          display_position: 9,
          is_origin: 1,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_name: 'Accessories',
          icon_image: '/assets/icons/accessories_icon.svg',
          display_position: 10,
          is_origin: 1,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_name: 'Wood',
          icon_image: '/assets/icons/pottery_icon.svg',
          display_position: 11,
          is_origin: 1,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.bulkDelete(DataBaseTableNames.CATEGORY, {}, {});
  }
};

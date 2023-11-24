import { QueryInterface } from 'sequelize';

import { LanguageEnum } from '../../constants';
import { DataBaseTableNames } from '../constants';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.bulkInsert(
      DataBaseTableNames.CATEGORY_IMAGE,
      [
        {
          category_id: 1,
          image_path: '/assets/images/recycledartworks_image.png',
          image_description: '',
          is_origin: 1,
          display_position: 0,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_id: 2,
          image_path: '/assets/images/plants_image.png',
          image_description: '',
          is_origin: 1,
          display_position: 1,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_id: 3,
          image_path: '/assets/images/organicfood_image.png',
          image_description: '',
          is_origin: 1,
          display_position: 2,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_id: 4,
          image_path: '/assets/images/pottery_image.png',
          image_description: '',
          is_origin: 1,
          display_position: 3,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_id: 5,
          image_path: '/assets/images/accessories_image.png',
          image_description: '',
          is_origin: 1,
          display_position: 4,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_id: 6,
          image_path: '/assets/images/wood_image.png',
          image_description: '',
          is_origin: 1,
          display_position: 5,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_id: 7,
          image_path: '/assets/images/recycledartworks_image.png',
          image_description: '',
          is_origin: 1,
          display_position: 6,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_id: 8,
          image_path: '/assets/images/plants_image.png',
          image_description: '',
          is_origin: 1,
          display_position: 7,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_id: 9,
          image_path: '/assets/images/organicfood_image.png',
          image_description: '',
          is_origin: 1,
          display_position: 8,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_id: 10,
          image_path: '/assets/images/pottery_image.png',
          image_description: '',
          is_origin: 1,
          display_position: 9,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_id: 11,
          image_path: '/assets/images/accessories_image.png',
          image_description: '',
          is_origin: 1,
          display_position: 10,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          category_id: 12,
          image_path: '/assets/images/wood_image.png',
          image_description: '',
          is_origin: 1,
          display_position: 11,
          language: LanguageEnum.ENGLISH,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.bulkDelete(DataBaseTableNames.CATEGORY_IMAGE, {}, {});
  }
};

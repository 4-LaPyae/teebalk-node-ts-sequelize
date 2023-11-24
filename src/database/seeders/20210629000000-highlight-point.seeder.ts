import { QueryInterface } from 'sequelize';

import { DataBaseTableNames } from '../constants';
import { HighlightTypeEnum } from '../models';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.bulkInsert(
      DataBaseTableNames.HIGHLIGHT_POINT,
      [
        {
          id: 1,
          name_id: 'Artisan',
          value: 1,
          type: HighlightTypeEnum.ETHICALITY_LEVEL,
          background_image: '/assets/images/highlight-point/artisan.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name_id: 'CultureAndTradition',
          value: 1,
          type: HighlightTypeEnum.ETHICALITY_LEVEL,
          background_image: '/assets/images/highlight-point/culture_tradition.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 3,
          name_id: 'OrganicProduce',
          value: 2,
          type: HighlightTypeEnum.ETHICALITY_LEVEL,
          background_image: '/assets/images/highlight-point/organic_produce.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 4,
          name_id: 'CraftGuru',
          value: 1,
          type: HighlightTypeEnum.ETHICALITY_LEVEL,
          background_image: '/assets/images/highlight-point/craft_guru.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 5,
          name_id: 'NaturalMaterial',
          value: 1,
          type: HighlightTypeEnum.ETHICALITY_LEVEL,
          background_image: '/assets/images/highlight-point/natural_material.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 6,
          name_id: 'FullOfSpirit',
          value: 1,
          type: HighlightTypeEnum.ETHICALITY_LEVEL,
          background_image: '/assets/images/highlight-point/full_of_spirit.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 7,
          name_id: 'TheUltimateTechnique',
          value: 1,
          type: HighlightTypeEnum.ETHICALITY_LEVEL,
          background_image: '/assets/images/highlight-point/ultimate_technique.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 8,
          name_id: 'MadeWithLove',
          value: 1,
          type: HighlightTypeEnum.ETHICALITY_LEVEL,
          background_image: '/assets/images/highlight-point/made_with_love.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 9,
          name_id: 'NoSuccessors',
          value: 0.1,
          type: HighlightTypeEnum.RARENESS,
          background_image: '/assets/images/highlight-point/no_successors.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 10,
          name_id: 'MaterialIsLife',
          value: 1,
          type: HighlightTypeEnum.ETHICALITY_LEVEL,
          background_image: '/assets/images/highlight-point/material_is_life.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 11,
          name_id: 'RareMaterial',
          value: 1,
          type: HighlightTypeEnum.ETHICALITY_LEVEL,
          background_image: '/assets/images/highlight-point/rare_material.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 12,
          name_id: 'NotEnoughResource',
          value: 0.1,
          type: HighlightTypeEnum.RARENESS,
          background_image: '/assets/images/highlight-point/insufficient_resource.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 13,
          name_id: 'NotEnoughHands',
          value: 0.1,
          type: HighlightTypeEnum.RARENESS,
          background_image: '/assets/images/highlight-point/not_enough_hands.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 14,
          name_id: 'NotEnoughMaterials',
          value: 0.1,
          type: HighlightTypeEnum.RARENESS,
          background_image: '/assets/images/highlight-point/not_enough_material.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 15,
          name_id: 'NotEnoughRecognition',
          value: 0.1,
          type: HighlightTypeEnum.RARENESS,
          background_image: '/assets/images/highlight-point/not_enough_recognition.png',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 16,
          name_id: 'NotEnoughProduction',
          value: 0.1,
          type: HighlightTypeEnum.RARENESS,
          background_image: '/assets/images/highlight-point/not_enough_production.png',
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.bulkDelete(DataBaseTableNames.HIGHLIGHT_POINT, {}, {});
  }
};

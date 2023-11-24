import { LanguageEnum } from '@freewilltokyo/freewill-be';
import { QueryInterface } from 'sequelize';

import {
  ExperienceCategoryContentDbModel,
  ExperienceCategoryDbModel,
  ExperienceCategoryTypeContentDbModel,
  ExperienceCategoryTypeDbModel
} from '../models';

export default {
  up: (queryInterface: QueryInterface, Sequelize: any) => {
    return queryInterface.sequelize.transaction(async transaction => {
      const categories = [
        {
          name: { en: 'Activity', ja: 'アクティビティ' },
          children: [
            { name: { en: 'Outdoors', ja: '自然・アウトドア' } },
            { name: { en: 'Culture・Tradition・Art', ja: '文化・伝統・アート' } },
            { name: { en: 'Agriculture・Forestry', ja: '農業・林業' } }
          ]
        },
        {
          name: { en: 'Cultural Craft', ja: 'クラフト・工芸' },
          children: [
            { name: { en: 'Ceramic Art', ja: '陶芸' } },
            { name: { en: 'Dyeing・Weaving', ja: '染め・織り' } },
            { name: { en: 'Wood Work', ja: '木工' } },
            { name: { en: 'Metal Work', ja: '金工' } },
            { name: { en: 'Accessory', ja: 'アクセサリー' } }
          ]
        },
        {
          name: { en: 'Tour', ja: 'ツアー' },
          children: [
            { name: { en: 'Eco Tour', ja: 'エコツアー' } },
            { name: { en: 'Study Trip', ja: 'スタディツアー' } },
            { name: { en: 'Other Tours', ja: 'その他ツアー' } }
          ]
        },
        {
          name: { en: 'Event', ja: 'イベント' },
          children: [
            { name: { en: 'Ethical', ja: 'エシカル' } },
            { name: { en: 'Culture・Tradition・Art', ja: '文化・伝統・アート' } },
            { name: { en: 'Other Events', ja: 'その他イベント' } }
          ]
        }
      ];

      let categoryTypePosition = 0;
      for await (const categoryType of categories) {
        categoryTypePosition++;

        const type = (await ExperienceCategoryTypeDbModel.create(
          {
            position: categoryTypePosition
          },
          { transaction }
        )) as any;

        await ExperienceCategoryTypeContentDbModel.create(
          {
            language: LanguageEnum.ENGLISH,
            categoryTypeId: type.id,
            name: categoryType.name.en
          },
          { transaction }
        );

        await ExperienceCategoryTypeContentDbModel.create(
          {
            language: LanguageEnum.JAPANESE,
            categoryTypeId: type.id,
            name: categoryType.name.ja
          },
          { transaction }
        );

        const children = categoryType.children;

        let categoryPosition = 0;
        for await (const key of children) {
          categoryPosition++;

          const category = (await ExperienceCategoryDbModel.create(
            {
              typeId: type.id,
              position: categoryPosition
            },
            { transaction }
          )) as any;

          await ExperienceCategoryContentDbModel.create(
            {
              name: key.name.en,
              language: LanguageEnum.ENGLISH,
              categoryId: category.id
            },
            { transaction }
          );
          await ExperienceCategoryContentDbModel.create(
            {
              name: key.name.ja,
              language: LanguageEnum.JAPANESE,
              categoryId: category.id
            },
            { transaction }
          );
        }
      }
    });
  },

  down: (queryInterface: QueryInterface, Sequelize: any) => {}
};

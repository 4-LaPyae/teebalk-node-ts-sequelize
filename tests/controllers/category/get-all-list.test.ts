import { LanguageEnum } from '../../../src/constants';
import { CategoryController } from '../../../src/controllers/category';
import { CategoryRepository } from '../../../src/dal';

const mockData = [
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
  }
];

jest.mock('../../../src/dal', () => {
  const categoryRepository = {
    getAllList: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    CategoryRepository: jest.fn(() => categoryRepository)
  };
});

describe('Controller:Category:GetAllList', () => {
  describe('Category:GetAllList', () => {
    const categoryRepository = new CategoryRepository();
    const categoryController = new CategoryController({ categoryRepository });

    describe('GetAllList:Check length result', () => {
      it('should return COUNT same value with rows.length', async () => {
        const result = await categoryController.getAllList();
        expect(result.count).toBe(result.rows.length);
      });
    });

    describe('GetAllList:Check language', () => {
      it('should return ENGLISH only', async () => {
        const result = await categoryController.getAllList({ language: LanguageEnum.ENGLISH });
        result.rows.forEach(item => {
          expect(item.language).toBe(LanguageEnum.ENGLISH);
        });
      });
    });
  });
});

import { RarenessLevelRepository, HighlightPointRepository } from '../../../src/dal';
import { RarenessLevelService } from '../../../src/services';
import { RarenessLevelController } from '../../../src/controllers';

const mockResult = {
  count: 1,
  rows: [
    {
      id: 1,
      nameId: "TheOnlyOneInThisPlanet",
      icon: "/assets/icons/dashboard/rareness-level/rareness_1st.svg",
      point: 5,
      createdAt: "2021-10-18T10:43:58.000Z",
      updatedAt: "2021-10-18T10:43:58.000Z",
      deletedAt: null
    }
  ]
}

const mockData = [{
  id: 1,
  nameId: "TheOnlyOneInThisPlanet",
  icon: "/assets/icons/dashboard/rareness-level/rareness_1st.svg",
  point: 5,
  createdAt: "2021-10-18T10:43:58.000Z",
  updatedAt: "2021-10-18T10:43:58.000Z",
  deletedAt: null
}]

jest.mock('../../../src/services', () => {
  const rarenessLevelService = {
    getAll: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    RarenessLevelService: jest.fn(() => rarenessLevelService)
  };
});

jest.mock('../../../src/dal', () => {
  return {
    RarenessLevelRepository: jest.fn(),
    HighlightPointRepository: jest.fn()
  };
});

describe('Controller:RarenessLevel:GetAll', () => {
  describe('RarenessLevel:Get', () => {
    const rarenessLevelRepository = new RarenessLevelRepository();
    const highlightPointRepository = new HighlightPointRepository();
    const rarenessLevelService = new RarenessLevelService({ rarenessLevelRepository, highlightPointRepository });
    const rarenessLevelController = new RarenessLevelController({ rarenessLevelService });

    describe('Get: Check return rareness level item', () => {
      it('should return equal the mock data', async () => {
        const result = await rarenessLevelController.getAll();
        expect(result).toStrictEqual(mockResult);
      });
    });
  });
});
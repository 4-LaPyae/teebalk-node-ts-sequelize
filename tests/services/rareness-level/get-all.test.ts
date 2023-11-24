import { RarenessLevelRepository, HighlightPointRepository } from '../../../src/dal';
import { RarenessLevelService } from '../../../src/services';

const mockData = [{
  id: 1,
  nameId: "TheOnlyOneInThisPlanet",
  icon: "/assets/icons/dashboard/rareness-level/rareness_1st.svg",
  point: 5,
  createdAt: "2021-10-18T10:43:58.000Z",
  updatedAt: "2021-10-18T10:43:58.000Z",
  deletedAt: null
}]

jest.mock('../../../src/dal', () => {
  const rarenessLevelRepository = {
    findAll: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    RarenessLevelRepository: jest.fn(() => rarenessLevelRepository),
    HighlightPointRepository: jest.fn(() => Promise.resolve())
  };
});

describe('Unitest:Service:RarenessLevel:Get', () => {
  describe('Cart:Create', () => {
    const rarenessLevelRepository = new RarenessLevelRepository();
    const highlightPointRepository = new HighlightPointRepository();

    const rarenessLevelService = new RarenessLevelService({ rarenessLevelRepository, highlightPointRepository });

    describe('Get:Check return result', () => {
      it('should return equal the mock data', async () => {
        const result = await rarenessLevelService.getAll();
        expect(result[0].id).toBe(mockData[0].id);
        expect(result[0].nameId).toBe(mockData[0].nameId);
        expect(result[0].point).toBe(mockData[0].point);
        expect(result[0].icon).toBe(mockData[0].icon);
      });
    });
  });
});

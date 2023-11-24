import { UserShippingAddressRepository } from '../../../src/dal';
import { UserShippingAddressService } from '../../../src/services';

const mockData = {
  id: 2,
  userId: 1,
};

jest.mock('../../../src/dal', () => {
  const userShippingAddressRepository = {
    update: jest.fn(() => Promise.resolve(mockData)),
    findOne: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    UserShippingAddressRepository: jest.fn(() => userShippingAddressRepository)
  };
});

describe('Unitest:Service:UserShippingAddress:Update', () => {
  describe('UserShippingAddress:Update', () => {
    const userShippingAddressRepository = new UserShippingAddressRepository();
    const userShippingAddressService = new UserShippingAddressService({ userShippingAddressRepository });

    describe('Update:Check return result', () => {
      it('should return equal the mock data', async () => {
        const result = await userShippingAddressService.markDefaultAddressById(1, 1);
        expect(result).toBe(true);
      });
    });
  });
});

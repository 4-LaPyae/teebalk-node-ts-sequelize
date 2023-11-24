import { UserShippingAddressRepository } from '../../../src/dal';
import { UserShippingAddressService } from '../../../src/services';
import { UserShippingAddressController } from '../../../src/controllers';

const mockData = {
  id: 2,
  userId: 1,
  name: 'Home',
  phone: '0123456',
  postalCode: '45435',
  country: 'Japan',
  countryCode: 'JP',
  state: 'state',
  stateCode: 'JP-47',
  city: 'Tokyo',
  addressLine1: 'as',
  addressLine2: null,
  emailAddress: 'email@gmail',
  language: 'en',
  createdAt: '2021-04-13T08:16:44.000Z',
  updatedAt: '2021-04-13T08:46:50.000Z'
};

jest.mock('../../../src/services', () => {
  const userShippingAddressService = {
    getListAddressByUserId: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    UserShippingAddressService: jest.fn(() => userShippingAddressService)
  };
});

jest.mock('../../../src/dal', () => {
  return {
    UserShippingAddressRepository: jest.fn()
  };
});

describe('Controller:UserShippingAddress:Get', () => {
  describe('UserShippingAddress:Get', () => {
    const userShippingAddressRepository = new UserShippingAddressRepository();
    const userShippingAddressService = new UserShippingAddressService({ userShippingAddressRepository });
    const userShippingAddressController = new UserShippingAddressController({ userShippingAddressService });

    describe('Get: Check return user shipping address item', () => {
      it('should return equal the mock data', async () => {
        const result = await userShippingAddressController.getAllByUserId(1);
        expect(result).toBe(mockData);
      });
    });

    describe('Get: Error missing userId', () => {
      it('should return ERROR message', async () => {
        try {
          await userShippingAddressController.getAllByUserId(0);
        } catch (error) {
          expect(error.message).toMatch('Parameter "userId" should not be empty');
        }
      });
    });
  });
});

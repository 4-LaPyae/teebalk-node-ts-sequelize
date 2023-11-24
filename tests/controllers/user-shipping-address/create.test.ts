import { UserShippingAddressRepository } from '../../../src/dal';
import { UserShippingAddressService } from '../../../src/services';
import { UserShippingAddressController } from '../../../src/controllers';
import { IUserShippingAddressRequestModel } from '../../../src/controllers/user-shipping-address/interfaces';

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
    create: jest.fn(() => Promise.resolve(mockData))
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

describe('Controller:UserShippingAddress:Create', () => {
  describe('UserShippingAddress:Create', () => {
    const userShippingAddressRepository = new UserShippingAddressRepository();

    const userShippingAddressService = new UserShippingAddressService({ userShippingAddressRepository });

    const userShippingAddressController = new UserShippingAddressController({ userShippingAddressService });

    const mockUserShippingAddress = {
      name: 'Home',
      phone: '0123456',
      postalCode: '45435',
      state: 'state',
      stateCode: 'JP-47',
      country: 'Japan',
      countryCode: 'JP',
      city: 'Tokyo',
      addressLine1: 'as',
      addressLine2: 'as',
      emailAddress: 'email@gmail',
      language: 'en'
    } as IUserShippingAddressRequestModel;

    describe('Create: Check return user shipping address item', () => {
      it('should return equal the mock data', async () => {
        const result = await userShippingAddressController.createUserShippingAddress(1, mockUserShippingAddress);
        expect(result).toBe(mockData);
      });
    });

    describe('Create: Error missing userId', () => {
      it('should return ERROR message', async () => {
        try {
          await userShippingAddressController.createUserShippingAddress(0, mockUserShippingAddress);
        } catch (error) {
          expect(error.message).toMatch('Parameter "userId" should not be empty');
        }
      });
    });
  });
});

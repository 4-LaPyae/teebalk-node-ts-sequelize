import { UserShippingAddressRepository } from '../../../src/dal';
import { UserShippingAddressService } from '../../../src/services';
import { UserShippingAddressController } from '../../../src/controllers';
import { IUserShippingAddressRequestModel } from '../../../src/controllers/user-shipping-address/interfaces';

jest.mock('../../../src/services', () => {
  const userShippingAddressService = {
    update: jest.fn(() => Promise.resolve())
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

describe('Controller:UserShippingAddress:Update', () => {
  describe('UserShippingAddress:Update', () => {
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
      language: 'en',
      default: true
    } as IUserShippingAddressRequestModel;

    describe('Update: Check return user shipping address item', () => {
      it('should return equal the mock data', async () => {
        const result = await userShippingAddressController.updateUserShippingAddress(1, 1, mockUserShippingAddress);
        expect(result).toBe(true);
      });
    });

    describe('Update: Error missing userId', () => {
      it('should return ERROR message', async () => {
        try {
          await userShippingAddressController.updateUserShippingAddress(0, 1, mockUserShippingAddress);
        } catch (error) {
          expect(error.message).toMatch('Parameter "userId" should not be empty');
        }
      });
    });

    describe('Update: Error missing shippingAddressId', () => {
      it('should return ERROR message', async () => {
        try {
          await userShippingAddressController.updateUserShippingAddress(1, 0, mockUserShippingAddress);
        } catch (error) {
          expect(error.message).toMatch('Parameter "shippingAddressId" should not be empty');
        }
      });
    });
  });
});

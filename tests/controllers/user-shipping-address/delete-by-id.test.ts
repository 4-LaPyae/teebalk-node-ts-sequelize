import { UserShippingAddressRepository } from '../../../src/dal';
import { UserShippingAddressService } from '../../../src/services';
import { UserShippingAddressController } from '../../../src/controllers';

jest.mock('../../../src/services', () => {
  const userShippingAddressService = {
    delete: jest.fn(() => Promise.resolve())
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

    describe('Delete: Check deleted status', () => {
      it('should delete ok', async () => {
        const result = await userShippingAddressController.deleteUserShippingAddress(1, 1);
        expect(result).toBe(true);
      });
    });

    describe('Delete: Error missing userId', () => {
      it('should return ERROR message', async () => {
        try {
          await userShippingAddressController.deleteUserShippingAddress(0, 1);
        } catch (error) {
          expect(error.message).toMatch('Parameter "userId" should not be empty');
        }
      });
    });

    describe('Delete: Error missing shippingAddressId', () => {
      it('should return ERROR message', async () => {
        try {
          await userShippingAddressController.deleteUserShippingAddress(1, 0);
        } catch (error) {
          expect(error.message).toMatch('Parameter "shippingAddressId" should not be empty');
        }
      });
    });
  });
});

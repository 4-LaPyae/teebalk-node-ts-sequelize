import { UserShippingAddressRepository } from '../../../src/dal';
import { UserShippingAddressService } from '../../../src/services';
import { UserShippingAddressController } from '../../../src/controllers';

jest.mock('../../../src/services', () => {
  const userShippingAddressService = {
    markDefaultAddressById: jest.fn(() => Promise.resolve())
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

describe('Controller:UserShippingAddress:MarkAsDefault', () => {
  describe('UserShippingAddress:MarkAsDefault', () => {
    const userShippingAddressRepository = new UserShippingAddressRepository();
    const userShippingAddressService = new UserShippingAddressService({ userShippingAddressRepository });
    const userShippingAddressController = new UserShippingAddressController({ userShippingAddressService });

    describe('MarkAsDefault: Check return user shipping address item', () => {
      it('should return true', async () => {
        const result = await userShippingAddressController.markDefaultUserShippingAddress(1, 1);
        expect(result).toBe(true);
      });
    });

    describe('Update: Error missing userId', () => {
      it('should return ERROR message', async () => {
        try {
          await userShippingAddressController.markDefaultUserShippingAddress(0, 1);
        } catch (error) {
          expect(error.message).toMatch('Parameter "userId" should not be empty');
        }
      });
    });

    describe('Update: Error missing shippingAddressId', () => {
      it('should return ERROR message', async () => {
        try {
          await userShippingAddressController.markDefaultUserShippingAddress(1, 0);
        } catch (error) {
          expect(error.message).toMatch('Parameter "shippingAddressId" should not be empty');
        }
      });
    });
  });
});

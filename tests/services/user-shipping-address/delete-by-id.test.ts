import { UserShippingAddressRepository } from '../../../src/dal';
import { UserShippingAddressService } from '../../../src/services';

jest.mock('../../../src/dal', () => {
  const userShippingAddressRepository = {
    delete: jest.fn(() => Promise.resolve())
  };

  return {
    UserShippingAddressRepository: jest.fn(() => userShippingAddressRepository)
  };
});

describe('Unitest:Service:UserShippingAddress:Delete', () => {
  describe('UserShippingAddress:Delete', () => {
    const userShippingAddressRepository = new UserShippingAddressRepository();
    const userShippingAddressService = new UserShippingAddressService({ userShippingAddressRepository });

    describe('Delete:Check return result', () => {
      it('should return true', async () => {
        const result = await userShippingAddressService.delete(1);
        expect(result).toBe(true);
      });
    });
  });
});

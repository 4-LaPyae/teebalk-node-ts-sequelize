import { IUserShippingAddressRequestModel } from '../../../src/controllers/user-shipping-address/interfaces';
import { UserShippingAddressRepository } from '../../../src/dal';
import { UserShippingAddressService } from '../../../src/services';

const mockData = {
  id: 2,
  userId: 1,
  name: 'Home',
  phone: '0123456',
  postalCode: '45435',
  country: 'Japan',
  state: 'state',
  city: 'Tokyo',
  addressLine1: 'as',
  addressLine2: null,
  language: 'en',
  createdAt: '2021-04-13T08:16:44.000Z',
  updatedAt: '2021-04-13T08:46:50.000Z'
};

jest.mock('../../../src/dal', () => {
  const userShippingAddressRepository = {
    create: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    UserShippingAddressRepository: jest.fn(() => userShippingAddressRepository)
  };
});

describe('Unitest:Service:UserShippingAddress:Create', () => {
  describe('Cart:Create', () => {
    const userShippingAddressRepository = new UserShippingAddressRepository();

    const userShippingAddressService = new UserShippingAddressService({ userShippingAddressRepository });
    const mockCart = {
      name: 'Home',
      phone: '0123456',
      postalCode: '45435',
      state: 'state',
      country: 'Japan',
      city: 'Tokyo',
      addressLine1: 'as',
      addressLine2: 'as',
      language: 'en',
      default: true
    } as IUserShippingAddressRequestModel;

    describe('Create:Check return result', () => {
      it('should return equal the mock data', async () => {
        const result = await userShippingAddressService.create(1, mockCart);
        expect(result.name).toBe(mockData.name);
        expect(result.userId).toBe(mockData.userId);
        expect(result.phone).toBe(mockData.phone);
        expect(result.postalCode).toBe(mockData.postalCode);
        expect(result.state).toBe(mockData.state);
        expect(result.country).toBe(mockData.country);
        expect(result.city).toBe(mockData.city);
        expect(result.addressLine1).toBe(mockData.addressLine1);
        expect(result.language).toBe(mockData.language);
      });
    });
  });
});

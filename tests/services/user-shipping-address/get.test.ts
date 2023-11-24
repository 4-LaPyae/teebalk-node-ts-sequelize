import { LanguageEnum } from '../../../src/constants';
import { UserShippingAddressRepository } from '../../../src/dal';
import { UserShippingAddressService } from '../../../src/services';

const mockData = [
  {
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
    default: 'true',
    createdAt: '2021-04-13T08:16:44.000Z',
    updatedAt: '2021-04-13T08:46:50.000Z'
  }
];

jest.mock('../../../src/dal', () => {
  const userShippingAddressRepository = {
    getAllByUserId: jest.fn(() => Promise.resolve(mockData))
  };

  return {
    UserShippingAddressRepository: jest.fn(() => userShippingAddressRepository)
  };
});

describe('Unitest:Service:UserShippingAddress:Get', () => {
  describe('Cart:Create', () => {
    const userShippingAddressRepository = new UserShippingAddressRepository();

    const userShippingAddressService = new UserShippingAddressService({ userShippingAddressRepository });

    describe('Get:Check return result', () => {
      it('should return equal the mock data', async () => {
        const result = await userShippingAddressService.getListAddressByUserId(1, { language: LanguageEnum.ENGLISH });
        expect(result[0].name).toBe(mockData[0].name);
        expect(result[0].userId).toBe(mockData[0].userId);
        expect(result[0].phone).toBe(mockData[0].phone);
        expect(result[0].postalCode).toBe(mockData[0].postalCode);
        expect(result[0].state).toBe(mockData[0].state);
        expect(result[0].country).toBe(mockData[0].country);
        expect(result[0].city).toBe(mockData[0].city);
        expect(result[0].addressLine1).toBe(mockData[0].addressLine1);
        expect(result[0].language).toBe(mockData[0].language);
        expect(result[0].default).toBe(mockData[0].default);
      });
    });
  });
});

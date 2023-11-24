import { LanguageEnum } from '@freewilltokyo/freewill-be';
import { UserShippingAddressRepository } from '../../../src/dal';
import { UserShippingAddressDbModel } from '../../../src/database/models';

const request = require('supertest');

const app = require('../index');

export const testGetUserShippingAddress = () => {
  describe('USER_SHIPPING_ADDRESS: Get a shipping address', () => {
    let userShippingAddress: any;
    let userToken: string;

    const userShippingAddressRepository = new UserShippingAddressRepository();
    const userShippingAddressData: any = {
      userId: 9999,
      name: 'User Shipping Name',
      phone: '012345678',
      postalCode: '45435',
      state: 'Okinawa',
      stateCode: 'JP-47',
      country: 'Japan',
      countryCode: 'JP',
      city: 'City',
      addressLine1: 'Shipping Address Line 1',
      addressLine2: 'Shipping Address Line 2',
      emailAddress: 'email@gmail.com',
      language: LanguageEnum.ENGLISH
    };

    beforeAll(async () => {
      userShippingAddress = await userShippingAddressRepository.create(userShippingAddressData);

      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';
    });

    afterAll(async () => {
      await UserShippingAddressDbModel.destroy({
        where: { id: userShippingAddress.id },
        force: true
      });
    });

    it('should return HTTP 401 when has not logged in in yet', async () => {
      const res = await request(app).get(`/api/v1/shipping-address`);
      expect(res.statusCode).toEqual(401);
    });

    it('should return user shipping addresses', async () => {
      const res = await request(app)
        .get(`/api/v1/shipping-address`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).not.toBeUndefined();
      expect(res.body.data[0].name).toEqual(userShippingAddressData.name);
      expect(res.body.data[0].phone).toEqual(userShippingAddressData.phone);
      expect(res.body.data[0].postalCode).toEqual(userShippingAddressData.postalCode);
      expect(res.body.data[0].state).toEqual(userShippingAddressData.state);
      expect(res.body.data[0].country).toEqual(userShippingAddressData.country);
      expect(res.body.data[0].city).toEqual(userShippingAddressData.city);
      expect(res.body.data[0].addressLine1).toEqual(userShippingAddressData.addressLine1);
      expect(res.body.data[0].addressLine2).toEqual(userShippingAddressData.addressLine2);
      expect(res.body.data[0].language).toEqual(userShippingAddressData.language);
    });
  });
};

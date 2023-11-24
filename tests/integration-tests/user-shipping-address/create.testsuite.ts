import { LanguageEnum } from '../../../src/constants';
import { UserShippingAddressDbModel } from '../../../src/database/models';

const request = require('supertest');

const app = require('../index');

export const testAddUserShippingAddress = () =>
  describe('[USER_SHIPPING_ADDRESS]: Add a shipping address', () => {
    let res: any;
    let userToken: string;

    beforeAll(async () => {
      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';
    });

    afterAll(async () => {
      await UserShippingAddressDbModel.destroy({
        where: { id: res.body.data.id },
        force: true
      });
    });

    const userShippingAddressData = {
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

    describe('Create: Successfull', () => {
      it('should get return added cart item', async () => {
        res = await request(app)
          .post(`/api/v1/shipping-address`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(userShippingAddressData);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).not.toBeUndefined();
        expect(res.body.data.name).toEqual(userShippingAddressData.name);
        expect(res.body.data.phone).toEqual(userShippingAddressData.phone);
        expect(res.body.data.postalCode).toEqual(userShippingAddressData.postalCode);
        expect(res.body.data.state).toEqual(userShippingAddressData.state);
        expect(res.body.data.country).toEqual(userShippingAddressData.country);
        expect(res.body.data.city).toEqual(userShippingAddressData.city);
        expect(res.body.data.addressLine1).toEqual(userShippingAddressData.addressLine1);
        expect(res.body.data.addressLine2).toEqual(userShippingAddressData.addressLine2);
        expect(res.body.data.language).toEqual(userShippingAddressData.language);
      });
    });

    describe('Create: Failed', () => {
      describe('Create: postalCode is invalid', () => {
        it('should get return 400 error', async () => {
          const invalidPostalCodeShippingAddressData = {
            ...userShippingAddressData,
            postalCode: '4+5435'
          };

          const errorRes = await request(app)
            .post(`/api/v1/shipping-address`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(invalidPostalCodeShippingAddressData);
          expect(errorRes.statusCode).toEqual(400);
        });
      });

      describe('Create: phone number is invalid', () => {
        it('should get return 400 error', async () => {
          const invalidPhoneNumberShippingAddressData = {
            ...userShippingAddressData,
            phone: '+0123456'
          };

          const errorRes = await request(app)
            .post(`/api/v1/shipping-address`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(invalidPhoneNumberShippingAddressData);
          expect(errorRes.statusCode).toEqual(400);
        });
      });
    });
  });

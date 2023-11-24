import { LanguageEnum } from '@freewilltokyo/freewill-be';
import { UserShippingAddressRepository } from '../../../src/dal';
import { UserShippingAddressDbModel } from '../../../src/database/models';

const request = require('supertest');

const app = require('../index');

export const testUpdateUserShippingAddress = () =>
  describe('USER_SHIPPING_ADDRESS: Update a shipping address by id', () => {
    let res: any;
    let userToken: string;
    let userShippingAddress: any;

    const userShippingAddressRepository = new UserShippingAddressRepository();
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

    beforeAll(async () => {
      const createUserShippingAddressData: any = {
        ...userShippingAddressData,
        userId: 9999
      };

      userShippingAddress = await userShippingAddressRepository.create(createUserShippingAddressData);

      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';
    });

    afterAll(async () => {
      await UserShippingAddressDbModel.destroy({
        where: { id: userShippingAddress.id },
        force: true
      });
    });

    describe('Update: Successfull', () => {
      it('should get return update user shipping address status', async () => {
        res = await request(app)
          .patch(`/api/v1/shipping-address/${userShippingAddress.id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(userShippingAddressData);
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toBe(true);
      });
    });

    describe('Update: Failed', () => {
      describe('Update: postalCode is invalid', () => {
        it('should get return 400 error', async () => {
          const invalidPostalCodeShippingAddressData = {
            ...userShippingAddressData,
            postalCode: '4+5435'
          };
          const errorRes = await request(app)
            .patch(`/api/v1/shipping-address/${userShippingAddress.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(invalidPostalCodeShippingAddressData);
          expect(errorRes.statusCode).toEqual(400);
        });
      });

      describe('Update: phone number is invalid', () => {
        it('should get return 400 error', async () => {
          const invalidPhoneNumberShippingAddressData = {
            ...userShippingAddressData,
            phone: '+0123456'
          };

          const errorRes = await request(app)
            .patch(`/api/v1/shipping-address/${userShippingAddress.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(invalidPhoneNumberShippingAddressData);
          expect(errorRes.statusCode).toEqual(400);
        });
      });

      describe('Update: authorization is invalid', () => {
        it('should get return 404 error', async () => {
          await userShippingAddressRepository.update(
            {
              userId: 0
            },
            { where: { id: userShippingAddress.id } }
          );

          const errorRes = await request(app)
            .patch(`/api/v1/shipping-address/${userShippingAddress.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(userShippingAddressData);
          expect(errorRes.statusCode).toEqual(404);
        });
      });
    });
  });

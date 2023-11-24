import { LanguageEnum } from '@freewilltokyo/freewill-be';
import { ProductRepository, UserShippingAddressRepository } from '../../../src/dal';
import { CartDbModel, ProductDbModel, ProductStatusEnum, ShopDbModel, UserShippingAddressDbModel } from '../../../src/database';

const request = require('supertest');

const app = require('../index');

export const testCreatePaymentIntent = () =>
  describe('[PAYMENT]: Create payment intent', () => {
    let userToken: string;
    const productRepository = new ProductRepository();
    const userShippingAddressRepository = new UserShippingAddressRepository();

    const userShippingAddressMockData = {
      amount: 100,
      products: [
        {
          productId: 1,
          colorId: 1,
          patternId: 1,
          customParameterId: 1,
          quantity: 1,
          amount: 100,
          language: LanguageEnum.ENGLISH
        }
      ],
      address: {
        id: 1,
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
        language: LanguageEnum.ENGLISH,
        isSaved: true
      }
    };

    beforeAll(async () => {
      userToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';
    });

    afterAll(async () => {});

    describe('Create payment intent', () => {
      describe('Create payment intent: Failed', () => {
        describe('Request data is invalid', () => {
          describe('ProductId is not valid', () => {
            it('should get return 400 error', async () => {
              const userShippingAddressData = {
                ...userShippingAddressMockData,
                products: [
                  {
                    productId: 0,
                    colorId: 1,
                    patternId: 1,
                    customParameterId: 1,
                    quantity: 1,
                    amount: 100,
                    language: LanguageEnum.ENGLISH
                  }
                ]
              };

              const errorRes = await request(app)
                .post(`/api/v1/payments/stripe/intent`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(userShippingAddressData);
              expect(errorRes.statusCode).toEqual(400);
            });
          });

          describe('Product Color Id is not valid', () => {
            it('should get return 400 error', async () => {
              const userShippingAddressData = {
                ...userShippingAddressMockData,
                products: [
                  {
                    productId: 1,
                    colorId: '0',
                    patternId: 1,
                    customParameterId: 1,
                    quantity: 1,
                    amount: 100,
                    language: LanguageEnum.ENGLISH
                  }
                ]
              };

              const errorRes = await request(app)
                .post(`/api/v1/payments/stripe/intent`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(userShippingAddressData);
              expect(errorRes.statusCode).toEqual(400);
            });
          });

          describe('Product Pattern Id is not valid', () => {
            it('should get return 400 error', async () => {
              const userShippingAddressData = {
                ...userShippingAddressMockData,
                products: [
                  {
                    productId: 1,
                    colorId: 1,
                    patternId: '0',
                    customParameterId: 1,
                    quantity: 1,
                    amount: 100,
                    language: LanguageEnum.ENGLISH
                  }
                ]
              };

              const errorRes = await request(app)
                .post(`/api/v1/payments/stripe/intent`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(userShippingAddressData);
              expect(errorRes.statusCode).toEqual(400);
            });
          });

          describe('Product Custom Parameter Id is not valid', () => {
            it('should get return 400 error', async () => {
              const userShippingAddressData = {
                ...userShippingAddressMockData,
                products: [
                  {
                    productId: 1,
                    colorId: 1,
                    patternId: 1,
                    customParameterId: -1,
                    quantity: 1,
                    amount: 100,
                    language: LanguageEnum.ENGLISH
                  }
                ]
              };

              const errorRes = await request(app)
                .post(`/api/v1/payments/stripe/intent`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(userShippingAddressData);
              expect(errorRes.statusCode).toEqual(400);
            });
          });

          describe('Product Quantity Id is not valid', () => {
            it('should get return 400 error', async () => {
              const userShippingAddressData = {
                ...userShippingAddressMockData,
                products: [
                  {
                    productId: 1,
                    colorId: 1,
                    patternId: 1,
                    customParameterId: 1,
                    quantity: 0,
                    amount: 100,
                    language: LanguageEnum.ENGLISH
                  }
                ]
              };

              const errorRes = await request(app)
                .post(`/api/v1/payments/stripe/intent`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(userShippingAddressData);
              expect(errorRes.statusCode).toEqual(400);
            });
          });

          describe('Product Amount is not valid', () => {
            it('should get return 400 error', async () => {
              const userShippingAddressData = {
                ...userShippingAddressMockData,
                amount: '00',
                products: [
                  {
                    productId: 1,
                    colorId: 1,
                    patternId: 1,
                    customParameterId: 1,
                    quantity: 1,
                    amount: '0',
                    language: LanguageEnum.ENGLISH
                  }
                ]
              };

              const errorRes = await request(app)
                .post(`/api/v1/payments/stripe/intent`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(userShippingAddressData);
              expect(errorRes.statusCode).toEqual(400);
            });
          });

          describe('Product Language is not valid', () => {
            it('should get return 400 error', async () => {
              const userShippingAddressData = {
                ...userShippingAddressMockData,
                products: [
                  {
                    productId: 1,
                    colorId: 1,
                    patternId: 1,
                    customParameterId: 1,
                    quantity: 1,
                    amount: 1,
                    language: 'absdsdsc'
                  }
                ]
              };

              const errorRes = await request(app)
                .post(`/api/v1/payments/stripe/intent`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(userShippingAddressData);
              expect(errorRes.statusCode).toEqual(400);
            });
          });
        });

        describe('Check middleware', () => {
          describe('Shopping cart was changed', () => {
            it('should get return 409 error', async () => {
              const userShippingAddressData = {
                ...userShippingAddressMockData,
                products: [
                  {
                    productId: 1,
                    colorId: 1,
                    patternId: 1,
                    customParameterId: 1,
                    quantity: 1,
                    amount: 100,
                    language: LanguageEnum.ENGLISH
                  }
                ]
              };

              const errorRes = await request(app)
                .post(`/api/v1/payments/stripe/intent`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(userShippingAddressData);
              expect(errorRes.statusCode).toEqual(409);
            });
            
          });

          describe('Validate cart item data', async () => {
            let product: any;
            let userShippingAddress: any;
            beforeEach(async () => {
              product = await productRepository.create({
                userId: 9999,
                shopId: 1,
                nameId: 'abc',
                status: ProductStatusEnum.PUBLISHED,
                price: 100,
                stock: 15
              });

              userShippingAddress = await userShippingAddressRepository.create({
                userId: 9999,
                name: 'Shipping Address Name',
                phone: '0123456',
                postalCode: '1234567',
                country: '',
                countryCode: 'JP',
                state: 'Shipping Address State',
                stateCode: 'JP-47',
                city: 'Shipping Address City',
                addressLine1: 'Shipping Address Line 1',
                addressLine2: 'Shipping Address Line 2',
                emailAddress: 'email@gmail.com',
                language: LanguageEnum.ENGLISH
              });
            });

            afterEach(async () => {
              await ProductDbModel.destroy({
                where: { userId: 9999 },
                force: true
              });

              await CartDbModel.destroy({
                where: { userId: 9999 },
                force: true
              });

              await ShopDbModel.destroy({
                where: { userId: 9999 },
                force: true
              });

              await UserShippingAddressDbModel.destroy({
                where: {
                  id: userShippingAddress.id
                },
                force: true
              });
            });

            it('should get return insufficient stock error', async () => {
              const userShippingAddressData = {
                amount: 330,
                usedCoins: 0,
                products: [
                  {
                    productId: product.id,
                    colorId: null,
                    patternId: null,
                    customParameterId: null,
                    quantity: 20,
                    amount: 110,
                    language: "en"
                }
                ],
                address: {
                  id: userShippingAddress.id,
                  name: "home",
                  phone: "012",
                  postalCode: "012",
                  countryCode: "012",
                  state: "state",
                  city: "city",
                  addressLine1: "address",
                  isSaved: true,
                  language: "en"
              }
              };

              const errorRes = await request(app)
                .post(`/api/v1/payments/stripe/intent`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(userShippingAddressData);
              expect(errorRes.statusCode).toEqual(409);
              expect(errorRes.body.error.message).toEqual(`InsufficientStock`);
            });

            it('should get return error code 409', async () => {
              const userShippingAddressData = {
                amount: 100,
                products: [
                  {
                    productId: product.id,
                    colorId: null,
                    patternId: null,
                    customParameterId: null,
                    quantity: 1,
                    amount: 110,
                    language: LanguageEnum.ENGLISH
                  }
                ],
                address: {
                  id: userShippingAddress.id,
                  name: 'Shipping Address Name',
                  phone: '0123456',
                  postalCode: '1234567',
                  country: '',
                  countryCode: 'JP',
                  state: 'Shipping Address State',
                  stateCode: 'JP-47',
                  city: 'Shipping Address City',
                  addressLine1: 'Shipping Address Line 1',
                  addressLine2: 'Shipping Address Line 2',
                  emailAddress: 'email@gmail.com',
                  language: LanguageEnum.ENGLISH,
                  isSaved: true
                }
              };

              const errorRes = await request(app)
                .post(`/api/v1/payments/stripe/intent`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(userShippingAddressData);
              expect(errorRes.statusCode).toEqual(409);
            });

            it('should get return error code 409', async () => {
              const userShippingAddressData = {
                amount: 100,
                products: [
                  {
                    productId: product.id,
                    colorId: null,
                    patternId: null,
                    customParameterId: null,
                    quantity: 1,
                    amount: 110,
                    language: LanguageEnum.ENGLISH
                  }
                ],
                address: {
                  id: userShippingAddress.id,
                  name: 'Shipping Address Name',
                  phone: '0123456',
                  postalCode: '1234567',
                  country: '',
                  countryCode: 'JP',
                  state: 'Shipping Address State',
                  stateCode: 'JP-47',
                  city: 'Shipping Address City',
                  addressLine1: 'Shipping Address Line 1',
                  addressLine2: 'Shipping Address Line 2',
                  emailAddress: 'email@gmail.com',
                  language: LanguageEnum.ENGLISH,
                  isSaved: true
                }
              };

              const errorRes = await request(app)
                .post(`/api/v1/payments/stripe/intent`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(userShippingAddressData);
              expect(errorRes.statusCode).toEqual(409);
            });


            // it('should get return error code 500', async () => {
            //   const userShippingAddressData = {
            //     amount: 110,
            //     products: [
            //       {
            //         productId: product.id,
            //         colorId: null,
            //         patternId: null,
            //         customParameterId: null,
            //         quantity: 1,
            //         amount: 110,
            //         language: LanguageEnum.ENGLISH
            //       }
            //     ],
            //     address: {
            //       id: userShippingAddress.id,
            //       name: 'Shipping Address Name',
            //       phone: '0123456',
            //       postalCode: '1234567',
            //       country: '',
            //       countryCode: 'JP',
            //       state: 'Shipping Address State',
            //       stateCode: 'JP-47',
            //       city: 'Shipping Address City',
            //       addressLine1: 'Shipping Address Line 1',
            //       addressLine2: 'Shipping Address Line 2',
            //       emailAddress: 'email@gmail.com',
            //       language: LanguageEnum.ENGLISH,
            //       isSaved: true
            //     }
            //   };

            //   const errorRes = await request(app)
            //     .post(`/api/v1/payments/stripe/intent`)
            //     .set('Authorization', `Bearer ${userToken}`)
            //     .send(userShippingAddressData);
            //   expect(errorRes.statusCode).toEqual(500);
            // });
          });
        });
      });
    });
  });

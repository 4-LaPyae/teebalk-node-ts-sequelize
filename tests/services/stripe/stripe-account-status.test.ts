import { UserStripeStatusEnum } from '../../../src/database/models';
import { stripeAccountToStatus } from '../../../src/services/stripe';

describe('[Services:Stripe:Helpers]', () => {
  describe('[stripeAccountToStatus]', () => {
    describe('[stripeAccountToStatus:Company]', () => {
      const stripeEventDataAccount: any = {
        id: jasmine.any(String),
        object: 'account',
        business_profile: {
          mcc: null,
          name: jasmine.any(String),
          support_address: null,
          support_email: null,
          support_phone: null,
          support_url: null,
          url: jasmine.any(String),
          product_description: null
        },
        capabilities: {
          legacy_payments: 'active'
        },
        charges_enabled: true,
        country: jasmine.any(String),
        default_currency: jasmine.any(String),
        details_submitted: true,
        email: null,
        payouts_enabled: true,
        settings: {
          branding: {
            icon: null,
            logo: null,
            primary_color: null
          },
          card_payments: {
            statement_descriptor_prefix: null,
            decline_on: {
              avs_failure: false,
              cvc_failure: false
            }
          },
          dashboard: {
            display_name: jasmine.any(String),
            timezone: jasmine.any(String)
          },
          payments: {
            statement_descriptor: jasmine.any(String),
            statement_descriptor_kana: null,
            statement_descriptor_kanji: null
          },
          payouts: {
            debit_negative_balances: false,
            schedule: {
              delay_days: jasmine.any(Number)
            },
            statement_descriptor: null
          }
        },
        type: jasmine.any(String),
        business_type: 'company',
        company: {
          address_kana: {
            city: jasmine.any(String),
            country: jasmine.any(String),
            line1: jasmine.any(String),
            line2: jasmine.any(String),
            postal_code: jasmine.any(String),
            state: jasmine.any(String),
            town: jasmine.any(String)
          },
          address_kanji: {
            city: jasmine.any(String),
            country: jasmine.any(String),
            line1: jasmine.any(String),
            line2: jasmine.any(String),
            postal_code: jasmine.any(String),
            state: jasmine.any(String),
            town: jasmine.any(String)
          },
          directors_provided: false,
          name: jasmine.any(String),
          name_kana: jasmine.any(String),
          name_kanji: jasmine.any(String),
          owners_provided: false,
          phone: jasmine.any(String),
          tax_id_provided: true,
          verification: {
            document: {
              back: null,
              details: null,
              details_code: null,
              front: null
            }
          }
        },
        created: jasmine.any(Number),
        external_accounts: {
          object: 'list',
          data: [
            {
              id: jasmine.any(String),
              object: 'bank_account',
              account: jasmine.any(String),
              account_holder_name: jasmine.any(String),
              account_holder_type: 'individual',
              bank_name: jasmine.any(String),
              country: jasmine.any(String),
              currency: jasmine.any(String),
              default_for_currency: true,
              fingerprint: jasmine.any(String),
              last4: jasmine.any(String),
              metadata: {},
              routing_number: jasmine.any(String),
              status: 'new'
            }
          ],
          has_more: false,
          total_count: 1,
          url: jasmine.any(String)
        },
        metadata: {
          userId: jasmine.any(String)
        },
        requirements: {
          current_deadline: null,
          currently_due: [],
          disabled_reason: null,
          eventually_due: [],
          past_due: [],
          pending_verification: []
        },
        tos_acceptance: {
          date: jasmine.any(Number),
          ip: jasmine.any(String),
          user_agent: jasmine.any(String)
        }
      };

      it('should status COMPLETED with liveMode=false', () => {
        const statusId = stripeAccountToStatus(stripeEventDataAccount, false);
        expect(statusId).toEqual(UserStripeStatusEnum.COMPLETED);
      });

      it('should status COMPLETED with liveMode=true', () => {
        const statusId = stripeAccountToStatus(stripeEventDataAccount, true);
        expect(statusId).toEqual(UserStripeStatusEnum.COMPLETED);
      });
    });
  });
});

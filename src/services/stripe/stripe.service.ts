import Logger from '@freewilltokyo/logger';
import { Transaction } from 'sequelize';
import Stripe from 'stripe';

import config from '../../config';
import { DEFAULT_CURRENCY } from '../../constants';
import { ConfigRepository } from '../../dal/config';
import { IUserModel, IUserStripeModel, UserStripeStatusEnum } from '../../database/models';
import { ApiError } from '../../errors';
import { LogMethodSignature } from '../../logger';
import { IUser } from '../auth';

import { AccountStatusPollingService } from './account-status-polling.service';
import { DEFAULT_STRIPE_ACCOUNT_COUNTRY, ONBOARDING_POLL_TIMEOUT, StripeAccountLinkTypeEnum } from './constants';
import {
  Currency,
  ICreatePaymentIntentOptions,
  ICreateStripeAccountData,
  ICreateTransferOptions,
  IUpdateStripeAccountData,
  UserStripeDetails
} from './interfaces';

const log = new Logger('SRV:StripeService');

export interface IStripeServiceOptionServices {
  stripeClient: Stripe;
  configRepository: ConfigRepository;
  accountStatusPollingService: AccountStatusPollingService;
}

export interface IStripeService {
  createCustomAccount(user: IUserModel, data: ICreateStripeAccountData): Promise<any>;

  updateCustomAccount(user: IUserModel, data: IUpdateStripeAccountData): Promise<any>;

  requestOnboardingDetails(userId: number, transaction: Transaction): Promise<any>;

  retrieveAccountById(stripeId: string): Promise<any>;

  retrievePayout(stripeId: string, stripe_account: string): Promise<any>;

  retrieveBalanceTransaction(stripeId: string, stripe_account: string): Promise<any>;

  createCheckoutSession(options: object, stripe_account: string): Promise<any>;

  requestBalance(stripe_account?: string): Promise<any>;

  updateUserStripeStatus(
    user: UserStripeDetails,
    stripeStatus: UserStripeStatusEnum | undefined,
    transaction?: Transaction
  ): Promise<boolean>;

  createFeeRefund(fee_id: string, refund_amount: number): Promise<any>;

  createRefund(refund_amount: number, charge_id: string, stripe_account: string): Promise<any>;

  createGroupTransfer(orderGroupId: number, options: ICreateTransferOptions): Promise<Stripe.Transfer>;

  createTransfer(options: ICreateTransferOptions): Promise<Stripe.Transfer>;

  schedulePayout(amount: number, currency: Currency, stripe_account: string): Promise<any>;

  getPaymentMethodsByCustomerId(customer: string): Promise<Stripe.PaymentMethod[]>;

  getPaymentMethodById(paymentMethodId: string): Promise<Stripe.PaymentMethod>;

  setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<Stripe.Customer>;

  retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
}

export interface IStripeServiceOptions {
  frontendUrl: string;
  currency?: Currency;
  publicKey?: string;
}

export class StripeService {
  public readonly publicKey: string;

  private readonly services: IStripeServiceOptionServices;
  private readonly currency: Currency = DEFAULT_CURRENCY;
  private readonly frontendUrl: string;

  constructor(services: IStripeServiceOptionServices, options: IStripeServiceOptions) {
    this.services = services;
    this.frontendUrl = options.frontendUrl as string;
    this.publicKey = options.publicKey as string;
    if (options.currency) {
      this.currency = options.currency;
    }
  }

  defaultStripeConnectedAccount(): string {
    const stripeConfigs = config.get('stripe');
    return stripeConfigs.purchaseConnectedAccount;
  }

  async retrieveAccountById(stripeId: string) {
    try {
      const result = await this.services.stripeClient.accounts.retrieve(stripeId);
      return result;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err.message);
    }
  }

  retrievePayout(stripeId: string, stripe_account: string) {
    try {
      return this.services.stripeClient.payouts.retrieve(stripeId, { stripe_account });
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err.message);
    }
  }

  async retrieveBalanceTransaction(stripeId: string, stripe_account: string) {
    try {
      const result = await this.services.stripeClient.balanceTransactions.retrieve(stripeId, { stripe_account });
      return result;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err.message);
    }
  }

  async createCheckoutSession(options: object, stripe_account: string) {
    try {
      const stripeConfig = this._getCheckoutSessionConfig(options);
      const paymentSession = await this.services.stripeClient.checkout.sessions.create(stripeConfig, { stripe_account } as any);
      return paymentSession;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err.message);
    }
  }

  async createCustomAccount(user: IUser, data: ICreateStripeAccountData): Promise<string> {
    try {
      if (!user?.id) {
        throw ApiError.badRequest('Parameter "userId" should not be empty');
      }
      if (typeof data !== 'object') {
        throw ApiError.badRequest('Parameter "data" should type of object');
      }

      const account: Stripe.Account = await this.services.stripeClient.accounts.create({
        tos_acceptance: data.tosAcceptance,
        external_account: data.bankAccountToken,
        country: data.country || DEFAULT_STRIPE_ACCOUNT_COUNTRY,
        type: 'custom',
        requested_capabilities: ['legacy_payments'],
        email: user.email,
        metadata: {
          userId: user.id,
          ssoUserId: user.externalId
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'manual'
              // https://stripe.com/docs/api/accounts/create#create_account-settings-payouts-schedule-interval
              // interval: 'weekly',
              // weekly_anchor: 'thursday'
            }
          }
        },
        business_profile: {
          url: this.frontendUrl // TODO it might be link to profile
        }
      } as Stripe.AccountCreateParams);

      return account?.id as string;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err.message);
    }
  }

  async updateCustomAccount(stripeAccounId: string, data: IUpdateStripeAccountData) {
    try {
      if (typeof data !== 'object') {
        throw ApiError.badRequest('Parameter "data" should type of object');
      }
      if (!stripeAccounId) {
        throw ApiError.internal('Parameter "stripeAccounId" should not be empty');
      }
      const account = await this.services.stripeClient.accounts.update(stripeAccounId, {
        external_account: data.bankAccountToken
      } as Stripe.AccountUpdateParams);

      return account;
    } catch (err) {
      log.error(err.message);
      throw ApiError.internal(err.message);
    }
  }

  async requestBalance(stripeAccount?: string): Promise<Stripe.Balance> {
    try {
      const result = await this.services.stripeClient.balance.retrieve({
        stripeAccount
      });
      return result;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err.message);
    }
  }

  async requestOnboardingDetails(
    user: IUserStripeModel,
    options = {
      failure_url: `${this.frontendUrl}/profile/${user.userId}?stripeOnboardingSuccess=false`,
      success_url: `${this.frontendUrl}/profile/${user.userId}?stripeOnboardingSuccess=true`
    }
  ) {
    try {
      const result = await this.services.stripeClient.accountLinks.create({
        ...options,
        collect: 'eventually_due',
        account: user.accountId,
        type: user.status === UserStripeStatusEnum.COMPLETED ? StripeAccountLinkTypeEnum.UPDATE : StripeAccountLinkTypeEnum.VERIFICATION
      });

      // start polling
      this.services.accountStatusPollingService.start(ONBOARDING_POLL_TIMEOUT);

      return result;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err.message);
    }
  }

  async createFeeRefund(fee_id: string, refund_amount: number) {
    try {
      const result = await this.services.stripeClient.applicationFees.createRefund(fee_id, {
        amount: refund_amount
      });
      return result;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err.message);
    }
  }

  /**
   * Create refunding of charge
   *
   * @param amount - refund amount
   * @param charge - charge id
   * @param stripeAccount - stripe account id
   */
  async createRefund(amount: number, charge: string, stripeAccount: string) {
    try {
      const result = await this.services.stripeClient.refunds.create({ amount, charge }, { stripeAccount });
      return result;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err.message);
    }
  }

  @LogMethodSignature(log)
  async schedulePayout(stripeAccount: string, currency: string = DEFAULT_CURRENCY) {
    try {
      const balances = await this.requestBalance(stripeAccount);
      const amount = balances.available.reduce((acc: number, balance) => {
        if (balance.currency === currency) {
          return acc + balance.amount;
        }
        return acc;
      }, 0);

      if (!amount) {
        throw new Error('Insufficient funds');
      }

      const result = await this.services.stripeClient.payouts.create({ amount, currency }, { stripeAccount });
      log.verbose('Scheduled payout manually. ID', result.id);
      return result;
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err.message);
    }
  }

  async retreiveCustomerById(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.services.stripeClient.customers.retrieve(customerId);
      if (!customer || customer.deleted) {
        throw new Error(`Customer ${customerId} does not exist or was deleted`);
      }

      return customer;
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  async createCustomer(user: { email: string; name: string; id: number }) {
    try {
      if (!user.email) {
        throw new Error('Parameter "user.email" should not be empty');
      }

      const customer = await this.services.stripeClient.customers.create({
        name: user.name,
        email: user.email,
        metadata: { userId: user.id }
      });

      log.verbose(`Just created customer account with ID ${customer.id} for ${user.id}`);

      return customer.id;
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  /**
   * Use if user has assigned customerId.
   *
   * @param customerId -  stripe customer id
   * @param options - options
   */
  @LogMethodSignature(log)
  async createIntentWithCustomerId(customerId: string, statementDescriptor: string, options: ICreatePaymentIntentOptions) {
    try {
      const data: Stripe.PaymentIntentCreateParams = {
        amount: options.amount,
        application_fee_amount: options.application_fee,
        currency: options.currency || this.currency,
        customer: customerId,
        metadata: options.metadata,
        statement_descriptor: statementDescriptor,
        payment_method_types: ['card'],
        transfer_data: {
          destination: options.stripeAccount || this.defaultStripeConnectedAccount()
        }
      };

      const paymentIntent = await this.services.stripeClient.paymentIntents.create(data);

      return {
        clientSecret: paymentIntent.client_secret,
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id
      };
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  /**
   * Use if user has assigned customerId.
   *
   * @param customerId -  stripe customer id
   * @param options - options
   */
  @LogMethodSignature(log)
  async createSetupIntentWithCustomerId(customerId: string, metadata?: Stripe.MetadataParam) {
    try {
      const data: Stripe.SetupIntentCreateParams = {
        customer: customerId,
        metadata,
        payment_method_types: ['card']
      };

      const setupIntent = await this.services.stripeClient.setupIntents.create(data);

      return {
        clientSecret: setupIntent.client_secret,
        client_secret: setupIntent.client_secret,
        id: setupIntent.id
      };
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  /**
   * Use if user has assigned customerId.
   *
   * @param customerId -  stripe customer id
   * @param orderGroupId - order group id of a combination of orders
   * @param options - options
   */
  @LogMethodSignature(log)
  async createPaymentIntentWithSeparateChargesTransfers(customerId: string, orderGroupId: number, options: ICreatePaymentIntentOptions) {
    try {
      const data: Stripe.PaymentIntentCreateParams = {
        amount: options.amount,
        currency: options.currency || this.currency,
        customer: customerId,
        metadata: options.metadata,
        statement_descriptor: 'Tells Product Purchase',
        payment_method_types: ['card'],
        transfer_group: String(orderGroupId)
      };

      const paymentIntent = await this.services.stripeClient.paymentIntents.create(data);

      return {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id
      };
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  /**
   * Create a Group Transfer to the connected account
   *
   * @param orderGroupId - order group id, transfer group
   * @param options - options
   */
  @LogMethodSignature(log)
  async createGroupTransfer(orderGroupId: number, options: ICreateTransferOptions): Promise<Stripe.Transfer> {
    try {
      const data: Stripe.TransferCreateParams = {
        amount: options.amount,
        currency: options.currency || this.currency,
        destination: options.destination || this.defaultStripeConnectedAccount(),
        transfer_group: String(orderGroupId),
        source_transaction: String(options.sourceTransaction)
      };

      const createdTransfer = await this.services.stripeClient.transfers.create(data);

      return createdTransfer;
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  /**
   * Create a Transfer to the connected account
   *
   * @param options - options
   */
  @LogMethodSignature(log)
  async createTransfer(options: ICreateTransferOptions): Promise<Stripe.Transfer> {
    try {
      const data: Stripe.TransferCreateParams = {
        amount: options.amount,
        currency: options.currency || this.currency,
        destination: options.destination || this.defaultStripeConnectedAccount(),
        metadata: options.metadata
      };

      const createdTransfer = await this.services.stripeClient.transfers.create(data);

      return createdTransfer;
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  async getPaymentMethodsByCustomerId(customer: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const result = await this.services.stripeClient.paymentMethods.list({ customer, type: 'card' });
      return result?.data?.length ? result?.data : [];
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  async getPaymentMethodById(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      const result = await this.services.stripeClient.paymentMethods.retrieve(paymentMethodId);
      return result;
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  attachPaymentMethod(paymentMethodId: string, customer: string): Promise<Stripe.PaymentMethod> {
    try {
      return this.services.stripeClient.paymentMethods.attach(paymentMethodId, { customer });
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      return this.services.stripeClient.paymentMethods.detach(paymentMethodId);
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    try {
      const [customer, paymentMethods] = await Promise.all([
        this.retreiveCustomerById(customerId),
        this.getPaymentMethodsByCustomerId(customerId)
      ]);

      if (customer && paymentMethods.some(pm => pm.id === paymentMethodId)) {
        if (customer.sources.data.some(source => source.id === paymentMethodId && customer.default_source !== paymentMethodId)) {
          await this.services.stripeClient.customers.update(customerId, {
            default_source: paymentMethodId
          });
        } else if (customer.invoice_settings.default_payment_method !== paymentMethodId) {
          await this.services.stripeClient.customers.update(customerId, {
            invoice_settings: { default_payment_method: paymentMethodId }
          });
        }
      }
    } catch (err) {
      log.error(err);
      throw new Error(err.message);
    }
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    try {
      return await this.services.stripeClient.paymentIntents.retrieve(paymentIntentId);
    } catch (err) {
      log.error(err);
      throw ApiError.internal(err.message);
    }
  }

  private _getCheckoutSessionConfig({ images, title, project_id, description, amount, fee }: any) {
    // TODO should be configurable
    const redirect_to = `${this.frontendUrl}/projects/${project_id}/payment-confirmation?session_id={CHECKOUT_SESSION_ID}`;

    return {
      success_url: redirect_to,
      cancel_url: redirect_to,
      payment_method_types: ['card'],
      submit_type: 'donate',
      payment_intent_data: {
        application_fee_amount: fee || undefined
      },
      line_items: [
        {
          name: title,
          description,
          images,
          amount,
          currency: this.currency,
          quantity: 1
        }
      ]
    } as Stripe.Checkout.SessionCreateParams;
  }
}

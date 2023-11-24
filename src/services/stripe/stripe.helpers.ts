import Stripe from 'stripe';

import config from '../../config';
import { UserStripeStatusEnum } from '../../database';

import { StripeBussinesType, StripeExternalAccountStatus, StripeIdentityVerificationStatus } from './constants';

const isLiveMode = config.get('stripe')?.secretKey?.startsWith('sk_live');

/**
 * User stripe statuses were defining based on analogy on stripe dashboard, cuz there present same labels (restricted, enabled, completed)
 * Look at https://dashboard.stripe.com/test/connect/accounts/overview.
 *
 * @param account - param account
 * @param liveMode - param liveMode
 */
/* eslint-disable complexity */
export const stripeAccountToStatus = (account: Stripe.Account, liveMode = isLiveMode): UserStripeStatusEnum | undefined => {
  if (!account.requirements || !account.business_type || !account.external_accounts) {
    return;
  }

  // BASIC VERIFICATION
  const { currently_due, eventually_due, pending_verification, disabled_reason } = account.requirements;

  if (disabled_reason?.startsWith('rejected')) {
    return UserStripeStatusEnum.REJECTED;
  }

  if (!account.charges_enabled || !account.payouts_enabled) {
    return UserStripeStatusEnum.RESTRICTED;
  }

  if (currently_due?.length) {
    if (currently_due[0].endsWith('.verification.document')) {
      return UserStripeStatusEnum.REQUIRES_IDENTITY_DOC;
    }

    return UserStripeStatusEnum.RESTRICTED;
  }

  if (eventually_due?.length) {
    if (eventually_due[0].endsWith('.verification.document')) {
      return UserStripeStatusEnum.REQUIRES_IDENTITY_DOC;
    }

    return UserStripeStatusEnum.RESTRICTED;
  }

  // if (currently_due?.length) {
  //   if (currently_due[0].endsWith('.verification.document')) {
  //     return UserStripeStatusEnum.REQUIRES_IDENTITY_DOC;
  //   }
  //
  //   return UserStripeStatusEnum.RESTRICTED;
  // }

  if (pending_verification?.length) {
    return UserStripeStatusEnum.RESTRICTED;
  }

  // VARIFY EXTERNAL ACCOUNT STATUS
  if (!account.external_accounts?.data?.length) {
    return UserStripeStatusEnum.RESTRICTED;
  }

  const extAccount: any = account.external_accounts.data[0] || {};

  if (liveMode) {
    // Usually "extAccount.status === new" if "isLiveMode === false"

    if (!extAccount.status) {
      return;
    }

    switch (extAccount.status) {
      case StripeExternalAccountStatus.ERROR:
      case StripeExternalAccountStatus.VERIFICATION_FAILED:
        return UserStripeStatusEnum.VERIFICATION_FAILED;
      // case StripeExternalAccountStatus.NEW:
      // case StripeExternalAccountStatus.VALIDATED:
      //   return UserStripeStatusEnum.PENDING_VERIFICATION;
      // case StripeExternalAccountStatus.VERIFIED:
      //   break;
    }
  }

  if (account.business_type === StripeBussinesType.INDIVIDUAL) {
    // VARIFY INDIVIDUAL DETAILS

    if (!account.individual?.verification?.document) {
      return;
    }

    const verification: any = account.individual.verification;

    switch (true) {
      case verification.status === StripeIdentityVerificationStatus.PENDING:
        return UserStripeStatusEnum.PENDING_VERIFICATION;
      case verification.status === StripeIdentityVerificationStatus.UNVERIFIED || verification.details_code:
        return UserStripeStatusEnum.VERIFICATION_FAILED;
      // case verification.status === StripeIdentityVerificationStatus.VERIFIED:
      //   return UserStripeStatusEnum.COMPLETED;
    }
  } else if (account.business_type === StripeBussinesType.COMPANY) {
    // VARIFY COMPANY DETAILS

    if (!account.company) {
      return;
    }

    const { tax_id_provided, verification } = account.company as any;

    if (!verification?.document) {
      return;
    }

    if (verification?.details_code) {
      return UserStripeStatusEnum.VERIFICATION_FAILED;
    }

    // company.tax_id_provided is always true when its test mode
    if (!tax_id_provided && liveMode) {
      return UserStripeStatusEnum.REQUIRES_IDENTITY_DOC;
    }
  }

  return UserStripeStatusEnum.COMPLETED;
};
/* eslint-enable complexity */

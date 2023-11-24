export const DEFAULT_STRIPE_ACCOUNT_COUNTRY = 'JP'; // japan

export const ONBOARDING_POLL_TIMEOUT = 300000; // 5 minutes

export enum StripeAccountLinkTypeEnum {
  VERIFICATION = 'custom_account_verification',
  UPDATE = 'custom_account_update'
}

export enum StripeEventTypeEnum {
  ACCOUNT_UPDATED = 'account.updated',
  CHARGE_SUCCEEDED = 'charge.succeeded',
  CHARGE_FAILED = 'charge.failed',
  CHARGE_REFUND_UPDATED = 'charge.refund.updated',
  CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed',
  PAYOUT_CREATED = 'payout.created',
  PAYOUT_UPDATED = 'payout.updated',
  PAYOUT_PAID = 'payout.paid',
  PAYOUT_CANCELLED = 'payout.canceled',
  PAYOUT_FAILED = 'payout.failed',

  PAYMENT_METHOD_ATTACHED = 'payment_method.attached',

  PAYMENT_INTENT_SUCCEEDED = 'payment_intent.succeeded',
  PAYMENT_INTENT_PROCESSING = 'payment_intent.processing',
  PAYMENT_INTENT_FAILED = 'payment_intent.payment_failed',
  PAYMENT_INTENT_CANCELED = 'payment_intent.canceled',

  TRANSFER_CREATED = 'transfer.created',
  TRANSFER_UPDATED = 'transfer.updated',
  TRANSFER_PAID = 'transfer.paid',
  TRANSFER_FAILED = 'transfer.failed',

  PAYMENT_CREATED = 'payment.created'
}

/**
 * User stripe statuses were defining based on analogy on stripe dashboard, cuz there present same labels (restricted, enabled, completed)
 * Look at https://dashboard.stripe.com/test/connect/accounts/overview.
 */
// export enum UserStripeStatusEnum {
//   RESTRICTED = 1,
//   ENABLED = 2,
//   COMPLETED = 3,
//   PENDING = 4,
//   VERIFICATION_FAILED = 5,
//   REJECTED = 6,
//   REQUIRES_IDENTITY_DOC = 7, // requires identification documents
//   PENDING_VERIFICATION = 8
// }

export enum StripeBussinesType {
  COMPANY = 'company',
  INDIVIDUAL = 'individual'
}

export enum StripeIdentityVerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified'
}

export enum StripeExternalAccountStatus {
  NEW = 'new',
  VALIDATED = 'validated',
  VERIFIED = 'verified',
  VERIFICATION_FAILED = 'verification_failed',
  ERROR = 'errored'
}

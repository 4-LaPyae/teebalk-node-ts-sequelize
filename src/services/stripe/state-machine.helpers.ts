import { IStateMachineTransition, StateMachine } from '@freewilltokyo/freewill-be';

import { UserStripeStatusEnum } from '../../database';

const transitions: IStateMachineTransition[] = [
  { from: UserStripeStatusEnum.PENDING, to: UserStripeStatusEnum.RESTRICTED },
  { from: UserStripeStatusEnum.PENDING, to: UserStripeStatusEnum.ENABLED },
  //  { from: UserStripeStatusEnum.PENDING, to : UserStripeStatusEnum.COMPLETED },
  { from: UserStripeStatusEnum.PENDING, to: UserStripeStatusEnum.VERIFICATION_FAILED },
  { from: UserStripeStatusEnum.PENDING, to: UserStripeStatusEnum.REJECTED },
  { from: UserStripeStatusEnum.PENDING, to: UserStripeStatusEnum.REQUIRES_IDENTITY_DOC },
  { from: UserStripeStatusEnum.PENDING, to: UserStripeStatusEnum.PENDING_VERIFICATION },

  //  { from: UserStripeStatusEnum.RESTRICTED, to : UserStripeStatusEnum.PENDING },
  { from: UserStripeStatusEnum.RESTRICTED, to: UserStripeStatusEnum.ENABLED },
  //  { from: UserStripeStatusEnum.RESTRICTED, to : UserStripeStatusEnum.COMPLETED },
  { from: UserStripeStatusEnum.RESTRICTED, to: UserStripeStatusEnum.VERIFICATION_FAILED },
  { from: UserStripeStatusEnum.RESTRICTED, to: UserStripeStatusEnum.REJECTED },
  { from: UserStripeStatusEnum.RESTRICTED, to: UserStripeStatusEnum.REQUIRES_IDENTITY_DOC },
  { from: UserStripeStatusEnum.RESTRICTED, to: UserStripeStatusEnum.PENDING_VERIFICATION },

  //  { from: UserStripeStatusEnum.ENABLED, to : UserStripeStatusEnum.PENDING },
  //  { from: UserStripeStatusEnum.ENABLED, to : UserStripeStatusEnum.RESTRICTED }
  //  { from: UserStripeStatusEnum.ENABLED, to : UserStripeStatusEnum.COMPLETED },
  { from: UserStripeStatusEnum.ENABLED, to: UserStripeStatusEnum.VERIFICATION_FAILED },
  { from: UserStripeStatusEnum.ENABLED, to: UserStripeStatusEnum.REJECTED },
  { from: UserStripeStatusEnum.ENABLED, to: UserStripeStatusEnum.REQUIRES_IDENTITY_DOC },
  { from: UserStripeStatusEnum.ENABLED, to: UserStripeStatusEnum.PENDING_VERIFICATION },

  // { from: UserStripeStatusEnum.COMPLETED, to : UserStripeStatusEnum.PENDING },
  // { from: UserStripeStatusEnum.COMPLETED, to : UserStripeStatusEnum.RESTRICTED },
  // { from: UserStripeStatusEnum.COMPLETED, to : UserStripeStatusEnum.ENABLED },
  // { from: UserStripeStatusEnum.COMPLETED, to : UserStripeStatusEnum.VERIFICATION_FAILED },
  { from: UserStripeStatusEnum.COMPLETED, to: UserStripeStatusEnum.REJECTED },
  // { from: UserStripeStatusEnum.COMPLETED, to : UserStripeStatusEnum.REQUIRES_IDENTITY_DOC },
  { from: UserStripeStatusEnum.COMPLETED, to: UserStripeStatusEnum.PENDING_VERIFICATION },

  { from: UserStripeStatusEnum.VERIFICATION_FAILED, to: UserStripeStatusEnum.PENDING },
  { from: UserStripeStatusEnum.VERIFICATION_FAILED, to: UserStripeStatusEnum.RESTRICTED },
  { from: UserStripeStatusEnum.VERIFICATION_FAILED, to: UserStripeStatusEnum.ENABLED },
  { from: UserStripeStatusEnum.VERIFICATION_FAILED, to: UserStripeStatusEnum.COMPLETED },
  { from: UserStripeStatusEnum.VERIFICATION_FAILED, to: UserStripeStatusEnum.REJECTED },
  { from: UserStripeStatusEnum.VERIFICATION_FAILED, to: UserStripeStatusEnum.REQUIRES_IDENTITY_DOC },
  { from: UserStripeStatusEnum.VERIFICATION_FAILED, to: UserStripeStatusEnum.PENDING_VERIFICATION },

  // { from: UserStripeStatusEnum.REJECTED, to : UserStripeStatusEnum.PENDING },
  // { from: UserStripeStatusEnum.REJECTED, to : UserStripeStatusEnum.RESTRICTED },
  // { from: UserStripeStatusEnum.REJECTED, to : UserStripeStatusEnum.ENABLED },
  // { from: UserStripeStatusEnum.REJECTED, to : UserStripeStatusEnum.COMPLETED },
  // { from: UserStripeStatusEnum.REJECTED, to : UserStripeStatusEnum.VERIFICATION_FAILED },
  // { from: UserStripeStatusEnum.REJECTED, to : UserStripeStatusEnum.REQUIRES_IDENTITY_DOC },
  // { from: UserStripeStatusEnum.REJECTED, to : UserStripeStatusEnum.PENDING_VERIFICATION },

  // { from: UserStripeStatusEnum.REQUIRES_IDENTITY_DOC, to : UserStripeStatusEnum.PENDING },
  // { from: UserStripeStatusEnum.REQUIRES_IDENTITY_DOC, to : UserStripeStatusEnum.RESTRICTED },
  // { from: UserStripeStatusEnum.REQUIRES_IDENTITY_DOC, to : UserStripeStatusEnum.ENABLED },
  { from: UserStripeStatusEnum.REQUIRES_IDENTITY_DOC, to: UserStripeStatusEnum.COMPLETED },
  { from: UserStripeStatusEnum.REQUIRES_IDENTITY_DOC, to: UserStripeStatusEnum.VERIFICATION_FAILED },
  { from: UserStripeStatusEnum.REQUIRES_IDENTITY_DOC, to: UserStripeStatusEnum.REJECTED },
  { from: UserStripeStatusEnum.REQUIRES_IDENTITY_DOC, to: UserStripeStatusEnum.PENDING_VERIFICATION },

  // { from: UserStripeStatusEnum.PENDING_VERIFICATION, to : UserStripeStatusEnum.PENDING },
  // { from: UserStripeStatusEnum.PENDING_VERIFICATION, to : UserStripeStatusEnum.RESTRICTED },
  // { from: UserStripeStatusEnum.PENDING_VERIFICATION, to : UserStripeStatusEnum.ENABLED },
  { from: UserStripeStatusEnum.PENDING_VERIFICATION, to: UserStripeStatusEnum.COMPLETED },
  { from: UserStripeStatusEnum.PENDING_VERIFICATION, to: UserStripeStatusEnum.VERIFICATION_FAILED },
  { from: UserStripeStatusEnum.PENDING_VERIFICATION, to: UserStripeStatusEnum.REJECTED },
  { from: UserStripeStatusEnum.PENDING_VERIFICATION, to: UserStripeStatusEnum.REQUIRES_IDENTITY_DOC }
];

export const stripeAccountStateMachine = new StateMachine(transitions);

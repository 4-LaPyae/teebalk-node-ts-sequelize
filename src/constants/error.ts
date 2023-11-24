export enum ErrorTypeEnum {
  ERROR = 'error',
  WARNING = 'warning'
}

export enum PurchaseItemErrorMessageEnum {
  ALL_PARAMETERS_ARE_REMOVED = 'AllParametersAreRemoved',
  PARAMETER_IS_REMOVED = 'ParameterIsRemoved',
  PARAMETER_INVALID = 'ParameterInvalid',
  DUPLICATED_PARAMETER = 'DuplicatedParameter',
  MISSING_PARAMETER = 'MissingParameter',
  CART_WAS_UPDATED = 'CartWasUpdated',
  CART_ITEM_HAS_ERROR = 'CartItemHasError',
  CART_ITEM_IS_NOT_IN_LIST = 'CartItemIsNotInList',
  PARAMETER_IS_NOT_FOUND = 'ParameterIsNotFound',
  PARAMETER_IS_NOT_EXIST = 'ParameterIsNotExist',
  PRODUCT_IS_UNAVAILABLE = 'ProductIsUnavailable',
  PRODUCT_NOT_ALLOW_OVERSEAS_SHIPPING = 'ProductIsNotAllowOverseasShipping',
  BUY_LATER_CART_ITEM_ALREADY_EXIST = 'BuyLaterCartItemAlreadyExist',
  OUT_OF_STOCK = 'ProductOutOfStock',
  INSUFFICIENT_STOCK = 'InsufficientStock',
  PRODUCT_PARAMETER_SET_IS_UNAVAILABLE = 'ProductParameterSetIsUnavailable'
}

export enum ProductErrorMessageEnum {
  PRODUCT_WAS_ALREADY_PUBLISHED = 'ProductWasAlreadyPublished',
  PRODUCT_WAS_ALREADY_UNPUBLISHED = 'ProductWasAlreadyUnpublished',
  PRODUCT_DOES_NOT_EXIST = 'ProductDoesNotExist',
  PRODUCT_IS_UNAVAILABLE_FOR_PUBLISH = 'ProductIsUnavailableForPublish',
  PRODUCT_IS_UNAVAILABLE_FOR_UNPUBLISH = 'ProductIsUnavailableForUnpublish',
  PRODUCT_IS_UNAVAILABLE_FOR_EDIT = 'ProductIsUnavailableForEdit',
  OVERLAP_PRODUCT_SHIPPING_FEES_RANGES = 'OverlapProductShippingFeesRanges',
  MISSING_PRODUCT_SHIPPING_FEES_RANGES = 'MissingProductShippingFeesRanges',
  PRODUCT_IS_UNAVAILABLE_FOR_PARAMETERSET = 'ProductIsUnavailableForParameterSet',
  PRODUCT_IS_UNAVAILABLE_FOR_CLONE = 'ProductIsUnavailableForClone'
}

export enum CoinsBalanceErrorMessageEnum {
  INSUFFICIENT_COINS_BALANCE = 'InsufficientCoinsBalance'
}

export enum ExperienceErrorMessageEnum {
  EXPERIENCE_IS_UNAVAILABLE_FOR_PUBLISH = 'ExperienceIsUnavailableForPublish',
  EXPERIENCE_IS_UNAVAILABLE_FOR_UNPUBLISH = 'ExperienceIsUnavailableForUnpublish',
  EXPERIENCE_WAS_ALREADY_UNPUBLISHED = 'ExperienceWasAlreadyUnpublished',
  EXPERIENCE_DOES_NOT_EXIST = 'ExperienceDoesNotExist',
  EXPERIENCE_IS_UNAVAILABLE_FOR_EDIT = 'ExperienceIsUnavailableForEdit'
}

export enum ExperienceCheckoutErrorMessageEnum {
  EXPERIENCE_IS_UNAVAILABLE = 'ExperienceIsUnavailable',
  EXPERIENCE_WAS_UPDATED = 'ExperienceWasUpdated',
  EXPERIENCE_SESSION_WAS_UPDATED = 'ExperienceSessionWasUpdated',
  SESSION_TICKET_DOES_NOT_EXIST = 'SessionTicketsDoesNotExist',
  SESSION_TICKET_IS_NOT_FOUND = 'SessionTicketsIsNotFound',
  SESSION_TICKET_IS_UNAVAILABLE = 'SessionTicketIsUnavailable',
  SESSION_TICKET_WAS_UPDATED = 'SessionTicketWasUpdated',
  TICKET_AMOUNT_INCORRECT = 'TicketAmountIncorrect'
}

export enum ExperienceReservationErrorMessageEnum {
  EVENT_LINK_DOES_NOT_EXIST = 'EventLinkDoesNotExist',
  INVALID_TICKET_OWNER = 'InvalidTicketOwner',
  TICKET_CODE_DOES_NOT_EXIST = 'TicketCodeDoesNotExist',
  ORDER_DOES_NOT_EXIST = 'OrderDoesNotExist'
}

export enum DatabaseErrorEnum {
  UNIQUE_CONSTRAINT_ERROR = 'SequelizeUniqueConstraintError'
}

export enum InstoreOrderErrorMessageEnum {
  ORDER_IS_CANCELED = 'InstoreOrderIsCanceled',
  ORDER_ALREADY_ASSIGNED = 'InstoreOrderAlreadyAssigned',
  ORDER_IS_UNAVAILABLE = 'InstoreOrderIsUnavailable',
  ORDER_HAS_ERROR = 'InstoreOrderHasError',
  ORDER_WAS_UPDATED = 'InstoreOrderWasUpdated',
  REQUIRED_SHIPPING_ADDRESS = 'RequiredShippingAddress',
  ORDER_NOT_ALLOW_OVERSEAS_SHIPPING = 'NotAllowOverseasShipping',
  NOT_ALLOW_ORDER_OWNER_CHECKOUT = 'NotAllowOrderOwnerCheckout',
  ORDER_IS_COMPLETED = 'InstoreOrderIsCompleted'
}

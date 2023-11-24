import { Model } from 'sequelize';

import { DataBaseModelNames } from '../constants';

import { registerModels } from './_model.decorator';

export * from './config.model';
export * from './geometry.model';
export * from './payment-transaction.model';
export * from './payment-transfer.model';
export * from './payout-transaction.model';
export * from './coin-action-queue.model';
export * from './user.model';
export * from './user-stripe.model';
export * from './order.model';
export * from './order-detail.model';
export * from './order-group.model';
export * from './snapshot-product-material.model';
export * from './product-content.model';
export * from './product-image.model';
export * from './product.model';
export * from './shop.model';
export * from './shop-address.model';
export * from './shop-content.model';
export * from './shop-email-send-history.model';
export * from './shop-email-template.model';
export * from './shop-image.model';
export * from './shop-regional-shipping-fees.model';
export * from './shop-shipping-fees.model';
export * from './user-shipping-address.model';
export * from './product-story.model';
export * from './product-story-image.model';
export * from './product-color.model';
export * from './product-pattern.model';
export * from './product-custom-parameter.model';
export * from './highlight-point.model';
export * from './ethicality-level.model';
export * from './rareness-level.model';
export * from './category.model';
export * from './category-image.model';
export * from './product-color.model';
export * from './product-pattern.model';
export * from './product-custom-parameter.model';
export * from './product-category.model';
export * from './product-material.model';
export * from './product-category.model';
export * from './product-producer.model';
export * from './product-transparency.model';
export * from './product-location.model';
export * from './product-highlight-points.model';
export * from './top-product.model';
export * from './top-product-v2.model';
export * from './cart.model';
export * from './cart-added-history.model';
export * from './product-regional-shipping-fees.model';
export * from './product-shipping-fees.model';
export * from './newsletter-subscriber.model';
export * from './exchange-rate.model';
export * from './product-inventory.model';
export * from './product-inventory-validation.model';
export * from './ordering-items.model';
export * from './email-user-optout.model';
export * from './product-available-notification.model';
export * from './low-stock-product-notification.model';
export * from './product-parameter-set.model';
export * from './product-parameter-set-image.model';

export * from './experience.model';
export * from './experience-content.model';
export * from './experience-image.model';
export * from './experience-session.model';
export * from './experience-session-ticket.model';
export * from './experience-ticket.model';
export * from './experience-category-model';
export * from './experience-category-content-model';
export * from './experience-category-type-model';
export * from './experience-category-type-content-model';
export * from './experience-organizer.model';
export * from './experience-material.model';
export * from './experience-transparency.model';
export * from './experience-highlight-points.model';
export * from './experience-order-management.model';
export * from './experience-order.model';
export * from './experience-order-detail.model';
export * from './experience-session-ticket-reservation.model';
export * from './experience-session-ticket-reservation-link.model';
export * from './experience-inventory-validation.model';
export * from './experience-campaign.model';
export * from './experience-campaign-ticket.model';
export * from './top-experience.model';

export * from './product-label-model';
export * from './product-label-content-model';
export * from './product-label-type-model';
export * from './product-label-type-content-model';
export * from './commercial-product.model';

export * from './instore-order-group.model';
export * from './instore-order-detail.model';
export * from './instore-order.model';

export * from './coin-transfer-transactions.model';

export * from './ambassador-content.model';
export * from './ambassador-highlight-points.model';
export * from './ambassador-image.model';
export * from './ambassador.model';
export * from './top-ambassador.model';

export * from './gift-set-content.model';
export * from './gift-set-product-content.model';
export * from './gift-set-product.model';
export * from './gift-set.model';
export * from './top-gift-set.model';

// should be invoked only when all models are exported
// TODO add another decorator to register all models
export const models = registerModels() as Map<DataBaseModelNames, Model>;

import {
  testNotSellerRole,
  testSellerRole,
  testGetByNameId,
  testCreateDraftProduct,
  testUpdateProductById,
  testSearchProducts,
  getTopListProducts,
  productParameterSetTest as testProductParameterSet,
  getProductWithParameterSetsTest,
  testCloneProduct,
  inStoreProductParameterSetTest
} from './product';
import {
  checkAbilityShipping,
  testGetList,
  testGetBuyLaterList,
  testGetUnavaiableItemsList,
  testAddProductsToCart,
  testUpdateCartItem,
  testDeleteItemInCart,
  testAddToBuyLater,
  testMoveToCart,
  testGetDuplicatedCartItemsList,
  testAddProductsToCartBuyLater,
  testDeleteUnavailableItemInCart,
  validateShopppingCart,
  validateShoppingCartShippingAddress,
  testTurnOffUnavailableMessage,
  instoreValidateAddProductsToCart
} from './cart';
import { testGetAllRarenessLevel } from './rareness-level';
import { testGetAllEthicalityLevels } from './ethicality-level';
import { testGetAllHighlightPoints } from './highlight-point';
import { testAddNewsletterSubscriber } from './newsletter-subscriber';
import { testCreatePaymentIntent } from './payment';
import { testAddUserShippingAddress } from './user-shipping-address/create.testsuite';
import { testGetUserShippingAddress } from './user-shipping-address/get.testsuite';
import { testUpdateUserShippingAddress } from './user-shipping-address/update.testsuite';
import { testDeleteUserShippingAddress } from './user-shipping-address/deleteById.testsuite';
import { testMarkAsDefaultUserShippingAddress } from './user-shipping-address/mark-as-default.testsuite';
import { shopGetAllOnlineProduct, testGetShopDetail, testUpdateShopById, testGetPublishedInstoreProducts, testGetPublishedOnlineProducts } from './shop';
import { testGetAllCategories } from './category';
import { testGetProductAvailableSubscribe as testEmailOptOuts } from './email-opt-outs';
import { testAuditProductAvailable, testAuditProductWithParameterSetsAvailable } from './audit-product-available';
import { createExperienceTicketTest, testCreateDraftExperience , getListExperiences, testUpdateStatusUnpublishExperience, testUpdateOutOfStockExperience, testDeleteExperience, getAllExperienceCategories, createExperienceImageTest, getExperienceByNameId, testUpdateExperienceById, getExperienceDetailInformation, getExperienceSingleSessionTicketsTest, testGetTopExperiences, testUpdateStatusPublishExperience, getExperienceOnlineEventLinkTest } from './experience';
import { getExperienceReservationsTest, cancelSharedTicketInExperienceReservationsTest, assignReservationLinkTest } from './experience-reservations';
import { statusValidateExperienceSessionTicketsTest, testCreateFreeTicketsOrder, validateExperienceSessionTicketsTest} from './experience-checkout';
import { testCreateExperiencePaymentIntent, testValidateExperienceConfirmPayment } from './experience-payment';
import { testTenderExperienceInformationAPI } from './render';
import { testCreateInstoreProduct, getListInstoreProducts, testPublishInstoreProduct, updatePositionInstoreProducts, testOutOfStockInstoreProduct, getInstoreProductByNameId, testUpdateInstoreProductById, testCloneInstoreProduct, getByNameId, testCloneInstoreFromOnlineProduct } from './in-store-product';
import {
  testCreateInstoreOrder,
  testDeleteInstoreOrder,
  testGetInstoreOrder,
  testAddMoreInstoreOrderItem,
  testCancelInstoreOrder,
  testDeleteInstoreOrderDetail,
  testGetCheckoutInstoreOrder,
  testGetAllInstoreOrderPayment,
  testCloneInstoreOrderGroup
} from './instore-order';
import { testCreateInstorePaymentIntent, testValidateInstorePayment } from './instore-product-payment';
import { testGetAllCoinTransferTransaction } from './ses-fund';

describe('integration_test', () => {
    testGetAllRarenessLevel(),
    testNotSellerRole(),
    testCreateDraftProduct(),
    testUpdateProductById(),
    testSearchProducts(),
    testSellerRole(),
    testGetByNameId(),
    getTopListProducts(),
    testGetList(),
    testGetAllHighlightPoints(),
    testGetAllEthicalityLevels(),
    testGetBuyLaterList(),
    checkAbilityShipping(),
    testGetUnavaiableItemsList()
    testAddProductsToCart(),
    testUpdateCartItem(),
    testDeleteItemInCart(),
    testAddToBuyLater(),
    testMoveToCart(),
    testAddProductsToCartBuyLater(),
    validateShopppingCart(),
    validateShoppingCartShippingAddress()
    testGetDuplicatedCartItemsList(),
    testAddUserShippingAddress(),
    testGetUserShippingAddress(),
    testUpdateUserShippingAddress(),
    testDeleteUserShippingAddress(),
    testMarkAsDefaultUserShippingAddress(),
    testCreatePaymentIntent(),
    testAddNewsletterSubscriber(),
    testGetShopDetail(),
    testUpdateShopById(),
    testGetAllCategories(),
    testDeleteUnavailableItemInCart(),
    testTurnOffUnavailableMessage(),
    testEmailOptOuts(),
    testAuditProductAvailable(),
    testProductParameterSet(),
    getProductWithParameterSetsTest(),
    testAuditProductWithParameterSetsAvailable(),
    testCreateDraftExperience(),
    getListExperiences(),
    testUpdateStatusUnpublishExperience(),
    testUpdateStatusPublishExperience(),
    testUpdateOutOfStockExperience(),
    createExperienceTicketTest(),
    getAllExperienceCategories(),
    createExperienceImageTest(),
    testDeleteExperience(),
    getExperienceDetailInformation(),
    getExperienceByNameId(),
    testUpdateExperienceById(),
    getExperienceSingleSessionTicketsTest(),
    validateExperienceSessionTicketsTest(),
    statusValidateExperienceSessionTicketsTest(),
    testCreateExperiencePaymentIntent(),
    testGetTopExperiences(),
    getExperienceReservationsTest(),
    testValidateExperienceConfirmPayment()
    testCreateFreeTicketsOrder(),
    testTenderExperienceInformationAPI(),
    cancelSharedTicketInExperienceReservationsTest(),
    getExperienceOnlineEventLinkTest(),
    assignReservationLinkTest(),
    testCreateInstoreProduct(),
    testPublishInstoreProduct()
    testCloneProduct(),
    getListInstoreProducts(),
    updatePositionInstoreProducts(),
    inStoreProductParameterSetTest(),
    testOutOfStockInstoreProduct(),
    getInstoreProductByNameId(),
    testUpdateInstoreProductById()
    testCloneInstoreProduct(),
    getByNameId(),
    testGetPublishedInstoreProducts()
    testCloneInstoreFromOnlineProduct(),
    shopGetAllOnlineProduct(),
    testCreateInstoreOrder(),
    instoreValidateAddProductsToCart(),
    testGetInstoreOrder(),
    testAddMoreInstoreOrderItem(),
    testCancelInstoreOrder(),
    testDeleteInstoreOrderDetail(),
    testDeleteInstoreOrder(),
    testGetCheckoutInstoreOrder(),
    testGetPublishedOnlineProducts(),
    testCreateInstorePaymentIntent(),
    testGetAllInstoreOrderPayment(),
    testValidateInstorePayment(),
    testCloneInstoreOrderGroup(),
    testGetAllCoinTransferTransaction()
});

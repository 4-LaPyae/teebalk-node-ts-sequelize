export enum DataBaseTableNames {
  CONSTANT = 'constants',

  USER = 'users',
  USER_STRIPE = 'user_stripe',
  USER_SHIPPING_ADDRESS = 'user_shipping_address',

  PAYMENT_TRANSACTION = 'payment_transaction',
  PAYMENT_TRANSFER = 'payment_transfers',
  PAYOUT_TRANSACTION = 'payout_transaction',
  COIN_ACTION_QUEUE = 'coin_action_queue',

  RARENESS_LEVEL = 'rareness_levels',

  AMBASSADOR = 'ambassadors',
  AMBASSADOR_CONTENT = 'ambassador_contents',
  AMBASSADOR_IMAGE = 'ambassador_images',
  AMBASSADOR_HIGHLIGHT_POINT = 'ambassador_highlight_points',
  TOP_AMBASSADOR = 'top_ambassadors',

  AVAIABLE_PRODUCT_NOTIFICATION = 'avaiable_product_notifications',
  SHOP = 'shops',
  SHOP_ADDRESS = 'shop_address',
  SHOP_CONTENT = 'shop_contents',
  SHOP_EMAIL_SEND_HISTORY = 'shop_email_send_history',
  SHOP_EMAIL_TEMPLATE = 'shop_email_template',
  SHOP_IMAGE = 'shop_images',
  SHOP_REGIONAL_SHIPPING_FEES = 'shop_regional_shipping_fees',
  SHOP_SHIPPING_FEES = 'shop_shipping_fees',

  PRODUCT = 'products',
  PRODUCT_CONTENT = 'product_contents',
  PRODUCT_IMAGE = 'product_images',
  PRODUCT_STORY = 'product_stories',
  PRODUCT_STORY_IMAGE = 'product_story_images',
  PRODUCT_COLOR = 'product_colors',
  PRODUCT_PATTERN = 'product_patterns',
  PRODUCT_CUSTOM_PARAMETER = 'product_custom_parameters',
  PRODUCT_MATERIAL = 'product_materials',
  PRODUCT_CATEGORY = 'product_categories',
  PRODUCT_LABEL = 'product_labels',
  PRODUCT_LABEL_CONTENT = 'product_label_contents',
  PRODUCT_LABEL_TYPE = 'product_label_types',
  PRODUCT_LABEL_TYPE_CONTENT = 'product_label_type_contents',
  PRODUCT_HIGHLIGHT_POINT = 'product_highlight_points',
  PRODUCT_PRODUCER = 'product_producers',
  PRODUCT_TRANSPARENCY = 'product_transparencies',
  PRODUCT_LOCATION = 'product_locations',
  PRODUCT_AVAILABLE_NOTIFICATIONS = 'product_available_notifications',
  HIGHLIGHT_POINT = 'highlight_points',
  ETHICALITY_LEVEL = 'ethicality_levels',
  NEWSLETTER_SUBSCRIBER = 'newsletter_subscribers',
  TOP_PRODUCT = 'top_products',
  TOP_PRODUCT_V2 = 'top_products_v2',
  COMMERCIAL_PRODUCT = 'commercial_products',
  CATEGORY = 'categories',
  CATEGORY_IMAGE = 'category_images',
  ORDER = 'orders',
  ORDER_DETAIL = 'order_details',
  ORDER_GROUP = 'order_groups',
  SNAPSHOT_PRODUCT_MATERIAL = 'snapshot_product_materials',
  CART = 'carts',
  CART_ADDED_HISTORY = 'cart_added_history',
  PRODUCT_REGIONAL_SHIPPING_FEES = 'product_regional_shipping_fees',
  PRODUCT_SHIPPING_FEES = 'product_shipping_fees',
  EXCHANGE_RATES = 'exchange_rates',
  PRODUCT_INVENTORY = 'product_inventory',
  ORDERING_ITEMS = 'product_order_management',
  USER_EMAIL_OPTOUT = 'user_email_optout',
  LOW_STOCK_PRODUCT_NOTIFICATIONS = 'low_stock_product_notifications',
  PRODUCT_PARAMETER_SETS = 'product_parameter_sets',
  PRODUCT_PARAMETER_SET_IMAGES = 'product_parameter_set_images',

  EXPERIENCES = 'experiences',
  EXPERIENCE_CONTENTS = 'experience_contents',
  EXPERIENCE_IMAGES = 'experience_images',
  EXPERIENCE_TICKETS = 'experience_tickets',
  EXPERIENCE_SESSIONS = 'experience_sessions',
  EXPERIENCE_SESSION_TICKETS = 'experience_session_tickets',
  EXPERIENCE_CATEGORIES = 'experience_categories',
  EXPERIENCE_CATEGORY_CONTENTS = 'experience_category_contents',
  EXPERIENCE_CATEGORY_TYPES = 'experience_category_types',
  EXPERIENCE_CATEGORY_TYPE_CONTENTS = 'experience_category_type_contents',
  EXPERIENCE_ORGANIZERS = 'experience_organizers',
  EXPERIENCE_MATERIAL = 'experience_materials',
  EXPERIENCE_TRANSPARENCY = 'experience_transparencies',
  EXPERIENCE_HIGHLIGHT_POINT = 'experience_highlight_points',
  EXPERIENCE_ORDER_MANAGEMENT = 'experience_order_management',
  EXPERIENCE_ORDER = 'experience_orders',
  EXPERIENCE_ORDER_DETAIL = 'experience_order_details',
  EXPERIENCE_SESSION_TICKET_RESERVATION = 'experience_session_ticket_reservations',
  EXPERIENCE_SESSION_TICKET_RESERVATION_LINK = 'experience_session_ticket_reservation_links',
  EXPERIENCE_CAMPAIGNS = 'experience_campaigns',
  EXPERIENCE_CAMPAIGN_TICKETS = 'experience_campaign_tickets',
  TOP_EXPERIENCE = 'top_experiences',
  INSTORE_ORDER_GROUP = 'instore_order_groups',
  INSTORE_ORDER = 'instore_orders',
  INSTORE_ORDER_DETAIL = 'instore_order_details',
  COIN_TRANSFER_TRANSACTIONS = 'coin_transfer_transactions',

  GIFT_SET = 'gift_sets',
  GIFT_SET_CONTENT = 'gift_set_contents',
  GIFT_SET_PRODUCT = 'gift_set_products',
  GIFT_SET_PRODUCT_CONTENT = 'gift_set_product_contents',
  TOP_GIFT_SET = 'top_gift_sets'
}

export enum DataBaseModelNames {
  CONSTANT = 'constant',

  USER = 'user',
  USER_STRIPE = 'userStripe',
  USER_SHIPPING_ADDRESS = 'userShippingAddress',

  PAYMENT_TRANSACTION = 'paymentTransaction',
  PAYMENT_TRANSFER = 'paymentTransfer',
  PAYOUT_TRANSACTION = 'payoutTransaction',
  COIN_ACTION_QUEUE = 'coinActionQueue',

  RARENESS_LEVEL = 'rarenessLevel',

  AMBASSADOR = 'ambassador',
  AMBASSADOR_CONTENT = 'ambassadorContent',
  AMBASSADOR_IMAGE = 'ambassadorImage',
  AMBASSADOR_HIGHLIGHT_POINT = 'ambassadorHighlightPoint',
  TOP_AMBASSADOR = 'topAmbassadors',

  AVAIABLE_PRODUCT_NOTIFICATION = 'avaiable_product_notifications',
  SHOP = 'shop',
  SHOP_ADDRESS = 'shopAddress',
  SHOP_CONTENT = 'shopContent',
  SHOP_EMAIL_SEND_HISTORY = 'shopEmailSendHistory',
  SHOP_EMAIL_TEMPLATE = 'shopEmailTemplate',
  SHOP_IMAGE = 'shopImage',
  SHOP_REGIONAL_SHIPPING_FEES = 'shopRegionalShippingFees',
  SHOP_SHIPPING_FEES = 'shopShippingFees',

  PRODUCT = 'product',
  PRODUCT_CONTENT = 'productContent',
  PRODUCT_IMAGE = 'productImage',
  PRODUCT_STORY = 'productStory',
  PRODUCT_STORY_IMAGE = 'productStoryImage',
  PRODUCT_COLOR = 'productColor',
  PRODUCT_PATTERN = 'productPattern',
  PRODUCT_CUSTOM_PARAMETER = 'productCustomParameter',
  PRODUCT_MATERIAL = 'productMaterial',
  PRODUCT_CATEGORY = 'productCategory',
  PRODUCT_LABEL = 'productLabels',
  PRODUCT_LABEL_CONTENT = 'productLabelContents',
  PRODUCT_LABEL_TYPE = 'productLabelTypes',
  PRODUCT_LABEL_TYPE_CONTENT = 'productLabel_type_contents',
  PRODUCT_HIGHLIGHT_POINT = 'productHighlightPoint',
  PRODUCT_PRODUCER = 'productProducer',
  PRODUCT_LOCATION = 'productLocation',
  HIGHLIGHT_POINT = 'highlightPoint',
  ETHICALITY_LEVEL = 'ethicalityLevel',
  PRODUCT_TRANSPARENCY = 'productTransparency',
  NEWSLETTER_SUBSCRIBER = 'newsletterSubscriber',
  TOP_PRODUCT = 'topProduct',
  TOP_PRODUCT_V2 = 'topProductV2',
  COMMERCIAL_PRODUCT = 'commercialProduct',
  CATEGORY = 'category',
  CATEGORY_IMAGE = 'categoryImage',
  ORDER = 'order',
  ORDER_DETAIL = 'orderDetail',
  ORDER_GROUP = 'orderGroup',
  SNAPSHOT_PRODUCT_MATERIAL = 'snapshotProductMaterial',
  CART = 'cart',
  CART_ADDED_HISTORY = 'cartAddedHistory',
  PRODUCT_REGIONAL_SHIPPING_FEES = 'productRegionalShippingFees',
  PRODUCT_SHIPPING_FEES = 'productShippingFees',
  PRODUCT_INVENTORY = 'productInventory',
  ORDERING_ITEMS = 'productOrderManagement',
  USER_EMAIL_OPTOUT = 'userEmailOptout',
  PRODUCT_AVAILABLE_NOTIFICATIONS = 'productAvailableNotifications',
  LOW_STOCK_PRODUCT_NOTIFICATIONS = 'lowStockProductNotifications',
  PRODUCT_PARAMETER_SETS = 'productParameterSets',
  PRODUCT_PARAMETER_SET_IMAGES = 'productParameterSetImages',

  EXPERIENCES = 'experiences',
  EXPERIENCE_CONTENTS = 'experience_contents',
  EXPERIENCE_IMAGES = 'experience_images',
  EXPERIENCE_TICKETS = 'experience_tickets',
  EXPERIENCE_SESSIONS = 'experience_sessions',
  EXPERIENCE_SESSION_TICKETS = 'experience_session_tickets',
  EXPERIENCE_CATEGORIES = 'experience_categories',
  EXPERIENCE_CATEGORY_CONTENTS = 'experience_category_contents',
  EXPERIENCE_CATEGORY_TYPES = 'experience_category_types',
  EXPERIENCE_CATEGORY_TYPE_CONTENTS = 'experience_category_type_contents',
  EXPERIENCE_ORGANIZERS = 'experience_organizers',
  EXPERIENCE_MATERIAL = 'experience_materials',
  EXPERIENCE_TRANSPARENCY = 'experience_transparency',
  EXPERIENCE_HIGHLIGHT_POINT = 'experience_highlight_points',
  EXPERIENCE_ORDER_MANAGEMENT = 'experience_order_management',
  EXPERIENCE_ORDER = 'experienceOrder',
  EXPERIENCE_ORDER_DETAIL = 'experienceOrderDetail',
  EXPERIENCE_SESSION_TICKET_RESERVATION = 'experienceSessionTicketReservation',
  EXPERIENCE_SESSION_TICKET_RESERVATION_LINK = 'experienceSessionTicketReservationLink',
  EXPERIENCE_CAMPAIGNS = 'experienceCampaigns',
  EXPERIENCE_CAMPAIGN_TICKETS = 'experienceCampaignTickets',
  TOP_EXPERIENCE = 'top_experiences',
  INSTORE_ORDER_GROUP = 'instoreOrderGroup',
  INSTORE_ORDER = 'instoreOrder',
  INSTORE_ORDER_DETAIL = 'instoreOrderDetail',
  COIN_TRANSFER_TRANSACTION = 'coinTransferTransaction',

  GIFT_SET = 'giftSet',
  GIFT_SET_CONTENT = 'giftSetContent',
  GIFT_SET_PRODUCT = 'giftSetProduct',
  GIFT_SET_PRODUCT_CONTENT = 'giftSetProductContent',
  TOP_GIFT_SET = 'topGiftSet'
}

export enum DatabaseProceduresEnum {
  REFRESH_ARTICLE_SOCIAL_IMPACT_SCORES = 'refresh_articles_si_scores',
  UPDATE_ARTICLE_SOCIAL_IMPACT_SCORE = 'update_article_si_score'
}
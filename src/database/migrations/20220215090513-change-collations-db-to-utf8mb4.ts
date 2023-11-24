/* eslint-disable @typescript-eslint/tslint/config */
'use strict';

import { QueryInterface, QueryOptions } from 'sequelize';

import { migrationWrapper } from '../transactions';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const dbName = queryInterface.sequelize.config.database;
    const migration = async (options: QueryOptions) => {
      await queryInterface.sequelize.query(`ALTER DATABASE ${dbName} CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.avaiable_product_notifications CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.carts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.category_images CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.constants CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.ethicality_levels CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.exchange_rates CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.highlight_points CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.newsletter_subscribers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.orders CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_groups CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transfers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payout_transaction CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_categories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_colors CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_contents CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_custom_parameters CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_highlight_points CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_images CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_inventory CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_locations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_materials CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_order_management CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_patterns CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_producers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_regional_shipping_fees CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_shipping_fees CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_stories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_story_images CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.rareness_levels CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.shops CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shop_contents CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shop_images CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.snapshot_product_materials CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.top_products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_stripe CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.exchange_rates CHANGE \`base_currency\` \`base_currency\` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.exchange_rates CHANGE \`target_currency\` \`target_currency\` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payout_transaction CHANGE \`currency\` \`currency\` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payout_transaction CHANGE \`payout_id\` \`payout_id\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payout_transaction CHANGE payout_error payout_error varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.categories CHANGE category_name category_name varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.categories CHANGE \`icon_image\` \`icon_image\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.category_images CHANGE \`image_path\` \`image_path\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.category_images CHANGE \`image_description\` \`image_description\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.constants CHANGE \`key\` \`key\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.constants CHANGE \`value\` \`value\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.ethicality_levels CHANGE \`field\` \`field\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.ethicality_levels CHANGE \`key\` \`key\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.highlight_points CHANGE \`name_id\` \`name_id\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.highlight_points CHANGE \`background_image\` \`background_image\` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.newsletter_subscribers CHANGE \`email\` \`email\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE \`product_name\` \`product_name\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE \`product_title\` \`product_title\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE \`product_image\` \`product_image\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE \`product_color\` \`product_color\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE \`product_pattern\` \`product_pattern\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE product_custom_parameter product_custom_parameter varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE product_produced_in_country product_produced_in_country varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE product_produced_in_prefecture product_produced_in_prefecture varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_groups CHANGE payment_intent_id payment_intent_id varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE \`code\` \`code\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE payment_intent_id payment_intent_id varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shop_title shop_title varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shop_email shop_email varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE product_title product_title varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_name shipping_name varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_phone shipping_phone varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_postal_code shipping_postal_code varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_country shipping_country varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_state shipping_state varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_city shipping_city varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_address_line1 shipping_address_line1 varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_address_line2 shipping_address_line2 varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_country_code shipping_country_code varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_state_code shipping_state_code varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_email_address shipping_email_address varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CHANGE payment_intent payment_intent varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CHANGE \`charge_id\` \`charge_id\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CHANGE \`fee_id\` \`fee_id\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CHANGE receipt_url receipt_url varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CHANGE \`error\` \`error\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CHANGE \`currency\` \`currency\` varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CHANGE transfer_id transfer_id varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transfers CHANGE stripe_account_id stripe_account_id varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transfers CHANGE stripe_transfer_id stripe_transfer_id varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_colors CHANGE \`color\` \`color\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_contents CHANGE \`annotation\` \`annotation\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_custom_parameters CHANGE custom_parameter custom_parameter varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_images CHANGE \`image_path\` \`image_path\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_images CHANGE image_description image_description varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_inventory CHANGE product_name_id product_name_id varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_locations CHANGE \`place\` \`place\` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_locations CHANGE \`place_id\` \`place_id\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_locations CHANGE \`city\` \`city\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_locations CHANGE \`country\` \`country\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_locations CHANGE \`description\` \`description\` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_materials CHANGE \`material\` \`material\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_order_management CHANGE payment_intent_id payment_intent_id varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_order_management CHANGE product_name_id product_name_id varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_patterns CHANGE \`pattern\` \`pattern\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_producers CHANGE \`name\` \`name\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_producers CHANGE \`position\` \`position\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_producers CHANGE \`photo\` \`photo\` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_regional_shipping_fees CHANGE prefecture_code prefecture_code varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_story_images CHANGE image_path image_path varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_story_images CHANGE image_description image_description varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.products CHANGE \`name_id\` \`name_id\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.products CHANGE produced_in_prefecture produced_in_prefecture varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.products CHANGE \`sdgs\` \`sdgs\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.rareness_levels CHANGE \`name_id\` \`name_id\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.rareness_levels CHANGE \`icon\` \`icon\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shop_contents CHANGE \`title\` \`title\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shop_images CHANGE \`image_path\` \`image_path\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shop_images CHANGE \`image_description\` \`image_description\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shops CHANGE \`name_id\` \`name_id\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.snapshot_product_materials CHANGE \`material\` \`material\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE \`name\` \`name\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE \`phone\` \`phone\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE \`postal_code\` \`postal_code\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE \`country\` \`country\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE \`state\` \`state\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE \`city\` \`city\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE address_line1 address_line1 varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE address_line2 address_line2 varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE \`country_code\` \`country_code\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE \`state_code\` \`state_code\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE \`email_address\` \`email_address\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_stripe CHANGE \`customer_id\` \`customer_id\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_stripe CHANGE \`account_id\` \`account_id\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_stripe CHANGE \`bank_account_id\` \`bank_account_id\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.users CHANGE \`description\` \`description\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_contents CHANGE \`title\` \`title\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_contents CHANGE \`sub_title\` \`sub_title\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_contents CHANGE \`description\` \`description\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_producers CHANGE \`comment\` \`comment\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_stories CHANGE \`content\` \`content\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_stories CHANGE \`plain_text_content\` \`plain_text_content\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_stories CHANGE \`summary_content\` \`summary_content\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_stories CHANGE \`plain_text_summary_content\` \`plain_text_summary_content\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE \`recycled_material_description\` \`recycled_material_description\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE \`plain_text_recycled_material_description\` \`plain_text_recycled_material_description\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE sdgs_report sdgs_report text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE plain_text_sdgs_report plain_text_sdgs_report text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE contribution_details contribution_details text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE plain_text_contribution_details plain_text_contribution_details text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE \`effect\` \`effect\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE plain_text_effect plain_text_effect text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE cultural_property cultural_property text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE plain_text_cultural_property plain_text_cultural_property text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE rareness_description rareness_description text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shop_contents CHANGE \`sub_title\` \`sub_title\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shop_contents CHANGE \`description\` \`description\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shop_contents CHANGE \`policy\` \`policy\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shops CHANGE \`website\` \`website\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shops CHANGE \`email\` \`email\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shops CHANGE \`phone\` \`phone\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;`
      );
    };

    await migrationWrapper(migration);
  },

  down: async (queryInterface: QueryInterface) => {
    const dbName = queryInterface.sequelize.config.database;
    const migration = async (options: QueryOptions) => {
      await queryInterface.sequelize.query(`ALTER DATABASE ${dbName} CHARACTER SET = utf8 COLLATE = utf8_general_ci;`);
      await queryInterface.sequelize.query(`
        ALTER TABLE ${dbName}.avaiable_product_notifications CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.carts CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.categories CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.category_images CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.constants CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.ethicality_levels CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.exchange_rates CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.highlight_points CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.newsletter_subscribers CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.orders CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.order_details CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.order_groups CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transfers CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payout_transaction CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.products CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_categories CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.product_colors CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.product_contents CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_custom_parameters CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_highlight_points CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.product_images CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_inventory CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_locations CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_materials CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_order_management CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.product_patterns CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_producers CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_regional_shipping_fees CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_shipping_fees CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.product_stories CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_story_images CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.rareness_levels CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.shops CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.shop_contents CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.shop_images CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.snapshot_product_materials CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.top_products CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.users CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`
      );
      await queryInterface.sequelize.query(`ALTER TABLE ${dbName}.user_stripe CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;`);
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.exchange_rates CHANGE base_currency base_currency varchar(3) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.exchange_rates CHANGE target_currency target_currency varchar(3) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payout_transaction CHANGE currency currency varchar(3) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payout_transaction CHANGE payout_id payout_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payout_transaction CHANGE payout_error payout_error varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.categories CHANGE category_name category_name varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.categories CHANGE icon_image icon_image varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.category_images CHANGE image_path image_path varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.category_images CHANGE image_description image_description varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.constants CHANGE \`key\` \`key\` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.constants CHANGE \`value\` \`value\` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.ethicality_levels CHANGE \`field\` \`field\` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.ethicality_levels CHANGE \`key\` \`key\` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.highlight_points CHANGE name_id name_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.highlight_points CHANGE background_image background_image varchar(1000) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.newsletter_subscribers CHANGE email email varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE product_name product_name varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE product_title product_title varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE product_image product_image varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE product_color product_color varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE product_pattern product_pattern varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE product_custom_parameter product_custom_parameter varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE product_produced_in_country product_produced_in_country varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_details CHANGE product_produced_in_prefecture product_produced_in_prefecture varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.order_groups CHANGE payment_intent_id payment_intent_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE code code varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE payment_intent_id payment_intent_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shop_title shop_title varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shop_email shop_email varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE product_title product_title varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_name shipping_name varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_phone shipping_phone varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_postal_code shipping_postal_code varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_country shipping_country varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_state shipping_state varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_city shipping_city varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_address_line1 shipping_address_line1 varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_address_line2 shipping_address_line2 varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_country_code shipping_country_code varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_state_code shipping_state_code varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.orders CHANGE shipping_email_address shipping_email_address varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CHANGE payment_intent payment_intent varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CHANGE charge_id charge_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CHANGE fee_id fee_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CHANGE receipt_url receipt_url varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CHANGE error error varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CHANGE currency currency varchar(3) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transaction CHANGE transfer_id transfer_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transfers CHANGE stripe_account_id stripe_account_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.payment_transfers CHANGE stripe_transfer_id stripe_transfer_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_colors CHANGE color color varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_contents CHANGE annotation annotation varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_custom_parameters CHANGE custom_parameter custom_parameter varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_images CHANGE image_path image_path varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_images CHANGE image_description image_description varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_inventory CHANGE product_name_id product_name_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_locations CHANGE place place varchar(300) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_locations CHANGE place_id place_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_locations CHANGE city city varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_locations CHANGE country country varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_locations CHANGE description description varchar(300) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_materials CHANGE material material varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_order_management CHANGE payment_intent_id payment_intent_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_order_management CHANGE product_name_id product_name_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_patterns CHANGE pattern pattern varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_producers CHANGE name name varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_producers CHANGE position position varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_producers CHANGE photo photo varchar(1000) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_regional_shipping_fees CHANGE prefecture_code prefecture_code varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_story_images CHANGE image_path image_path varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_story_images CHANGE image_description image_description varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.products CHANGE name_id name_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.products CHANGE produced_in_prefecture produced_in_prefecture varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.products CHANGE sdgs sdgs varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.rareness_levels CHANGE name_id name_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.rareness_levels CHANGE icon icon varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shop_contents CHANGE title title varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shop_images CHANGE image_path image_path varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shop_images CHANGE image_description image_description varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shops CHANGE name_id name_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.snapshot_product_materials CHANGE material material varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE name name varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE phone phone varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE postal_code postal_code varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE country country varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE state state varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE city city varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE address_line1 address_line1 varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE address_line2 address_line2 varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE country_code country_code varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE state_code state_code varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_shipping_address CHANGE email_address email_address varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_stripe CHANGE customer_id customer_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_stripe CHANGE account_id account_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.user_stripe CHANGE bank_account_id bank_account_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.users CHANGE description description text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_contents CHANGE title title text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_contents CHANGE sub_title sub_title text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_contents CHANGE description description text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_producers CHANGE comment comment text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_stories CHANGE content content text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_stories CHANGE plain_text_content plain_text_content text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_stories CHANGE summary_content summary_content text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_stories CHANGE plain_text_summary_content plain_text_summary_content text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE recycled_material_description recycled_material_description text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE plain_text_recycled_material_description plain_text_recycled_material_description text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE sdgs_report sdgs_report text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE plain_text_sdgs_report plain_text_sdgs_report text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE contribution_details contribution_details text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE plain_text_contribution_details plain_text_contribution_details text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE effect effect text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE plain_text_effect plain_text_effect text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE cultural_property cultural_property text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE plain_text_cultural_property plain_text_cultural_property text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.product_transparencies CHANGE rareness_description rareness_description text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shop_contents CHANGE sub_title sub_title text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shop_contents CHANGE description description text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shop_contents CHANGE policy policy text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shops CHANGE website website text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shops CHANGE email email text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE ${dbName}.shops CHANGE phone phone text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`
      );
    };

    await migrationWrapper(migration);
  }
};

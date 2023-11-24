import Logger from '@freewilltokyo/logger';
import { FindOptions, Op, Transaction } from 'sequelize';

import { OrderItemInventoryStatusEnum } from '../../constants';
import { ICartItem } from '../../controllers/cart/interfaces';
import { ICreatePurchaseProduct } from '../../controllers/payment/interfaces';
import {
  IConfigRepository,
  ILowStockProductNotificationRepository,
  IProductDao,
  IProductRepository,
  ProductParameterSetRepository
} from '../../dal';
import { PRODUCT_RELATED_MODELS } from '../../dal/product/constants';
import { IOrderingItemsModel, IProductInventoryValidation, IProductModel, LockingTypeEnum, SalesMethodEnum } from '../../database';
import { OrderingItemsService } from '../ordering-items';

const log = new Logger('SRV:ProductInventoryService');
const { parameterSets } = PRODUCT_RELATED_MODELS;

export interface ProductInventoryServiceOptions {
  productRepository: IProductRepository;
  orderingItemsService: OrderingItemsService;
  configRepository: IConfigRepository;
  lowStockProductNotificationRepository: ILowStockProductNotificationRepository;
  productParameterSetRepository: ProductParameterSetRepository;
}

export class ProductInventoryService {
  private services: ProductInventoryServiceOptions;

  constructor(services: ProductInventoryServiceOptions) {
    this.services = services;
  }

  async checkQuantityStockByProductsId(
    inventoryValidations: IProductInventoryValidation[],
    userId?: number,
    orderId?: number,
    options?: FindOptions
  ): Promise<OrderItemInventoryStatusEnum> {
    // Get inventory
    const productIDs = inventoryValidations.map(validation => validation.productId);

    const products = await this.services.productRepository.findAll({
      where: { id: productIDs },
      attributes: ['id', 'stock', 'hasParameters'],
      include: [parameterSets]
    });

    for (const product of products) {
      const purchaseProduct = inventoryValidations.find(p => p.productId === product.id) as IProductInventoryValidation;

      let productStock = product.stock;
      if (product.hasParameters && product.parameterSets) {
        const selectedParameterSet = product.parameterSets.find(
          parameterSet =>
            parameterSet.enable &&
            parameterSet.colorId === purchaseProduct.colorId &&
            parameterSet.customParameterId === purchaseProduct.customParameterId
        );

        if (selectedParameterSet) {
          productStock = selectedParameterSet.stock;
        }
      }

      const numberStock = await this.services.orderingItemsService.getStockAfterMinusOrdering(
        product.id,
        purchaseProduct.type || LockingTypeEnum.STOCK,
        purchaseProduct.colorId,
        purchaseProduct.customParameterId,
        productStock,
        userId,
        orderId
      );

      if (numberStock !== undefined) {
        if (numberStock === 0) {
          return OrderItemInventoryStatusEnum.OUT_OF_STOCK;
        }

        if (purchaseProduct.quantity > numberStock) {
          return OrderItemInventoryStatusEnum.INSUFFICIENT;
        }
      }
    }

    return OrderItemInventoryStatusEnum.INSTOCK;
  }

  async checkQuantityShipLaterStockByProductsId(
    inventoryValidations: IProductInventoryValidation[],
    userId?: number,
    orderId?: number,
    options?: FindOptions
  ): Promise<OrderItemInventoryStatusEnum> {
    // Get inventory
    const productIDs = inventoryValidations.map(validation => validation.productId);

    const products = await this.services.productRepository.findAll({
      where: { id: productIDs },
      attributes: ['id', 'shipLaterStock', 'hasParameters'],
      include: [parameterSets]
    });

    for (const product of products) {
      const purchaseProduct = inventoryValidations.find(p => p.productId === product.id) as IProductInventoryValidation;

      let productStock = product.shipLaterStock;
      if (product.hasParameters && product.parameterSets) {
        const selectedParameterSet = product.parameterSets.find(
          parameterSet =>
            parameterSet.enable &&
            parameterSet.colorId === purchaseProduct.colorId &&
            parameterSet.customParameterId === purchaseProduct.customParameterId
        );

        if (selectedParameterSet) {
          productStock = selectedParameterSet.shipLaterStock;
        }
      }

      const numberStock = await this.services.orderingItemsService.getStockAfterMinusOrdering(
        product.id,
        LockingTypeEnum.SHIP_LATER_STOCK,
        purchaseProduct.colorId,
        purchaseProduct.customParameterId,
        productStock,
        userId,
        orderId
      );

      if (numberStock !== undefined) {
        if (numberStock === 0) {
          return OrderItemInventoryStatusEnum.OUT_OF_STOCK;
        }

        if (purchaseProduct.quantity > numberStock) {
          return OrderItemInventoryStatusEnum.INSUFFICIENT;
        }
      }
    }

    return OrderItemInventoryStatusEnum.INSTOCK;
  }

  async decreaseMainProductStock(productId: number, quantity: number, checkLowMainStock = true, transaction?: Transaction) {
    await Promise.all([
      this.services.productRepository.decreaseStockNumber({ by: quantity, where: { id: productId, stock: { [Op.ne]: 0 } }, transaction }),
      this.services.productRepository.increasePurchasedNumber({ by: quantity, where: { id: productId }, transaction })
    ]);

    if (checkLowMainStock) {
      await this.checkLowStock(productId, transaction);
    }
  }

  async decreaseProductShipLaterStock(productId: number, quantity: number, transaction?: Transaction) {
    await Promise.all([
      this.services.productRepository.decreaseShipLaterStockNumber({
        by: quantity,
        where: { id: productId, shipLaterStock: { [Op.ne]: 0 } },
        transaction
      }),
      this.services.productRepository.increasePurchasedNumber({ by: quantity, where: { id: productId }, transaction })
    ]);
  }

  async decreaseProductParameterSetStock(
    productId: number,
    stock: number,
    colorId?: number | null,
    customParameterId?: number | null,
    transaction?: Transaction
  ) {
    await Promise.all([
      this.services.productParameterSetRepository.decreaseStockNumber({
        by: stock,
        where: {
          productId,
          colorId: colorId || null,
          customParameterId: customParameterId || null,
          stock: { [Op.ne]: 0 }
        },
        transaction
      }),
      this.services.productParameterSetRepository.increasePurchasedNumber({
        by: stock,
        where: {
          productId,
          colorId: colorId || null,
          customParameterId: customParameterId || null
        },
        transaction
      })
    ]);
  }

  async decreaseProductParameterSetShipLaterStock(
    productId: number,
    stock: number,
    colorId?: number | null,
    customParameterId?: number | null,
    transaction?: Transaction
  ) {
    await Promise.all([
      this.services.productParameterSetRepository.decreaseShipLaterStockNumber({
        by: stock,
        where: {
          productId,
          colorId: colorId || null,
          customParameterId: customParameterId || null,
          shipLaterStock: { [Op.ne]: 0 }
        },
        transaction
      }),
      this.services.productParameterSetRepository.increasePurchasedNumber({
        by: stock,
        where: {
          productId,
          colorId: colorId || null,
          customParameterId: customParameterId || null
        },
        transaction
      })
    ]);
  }

  async updateByProductId(productId: number, stock?: number | null, shipLaterStock?: number | null, transaction?: Transaction) {
    await this.services.productRepository.update({ stock, shipLaterStock }, { where: { id: productId }, transaction });
    await this.removeLowStockProductNotification(productId, stock, transaction);
  }

  setOutOfStock(productId: number, salesMethod?: SalesMethodEnum, transaction?: Transaction) {
    const shipLaterStock = salesMethod === SalesMethodEnum.INSTORE ? 0 : undefined;
    return Promise.all([
      this.updateByProductId(productId, 0, shipLaterStock, transaction),
      this.services.productParameterSetRepository.update(
        { stock: 0, shipLaterStock },
        {
          where: { productId },
          transaction
        }
      )
    ]);
  }

  async validateQuantityInventories(
    cartItems: ICartItem[] | ICreatePurchaseProduct[],
    userId?: number
  ): Promise<OrderItemInventoryStatusEnum | null> {
    if (!cartItems || cartItems.length === 0) {
      return null;
    }

    const listProducts: IProductInventoryValidation[] = [];
    cartItems.forEach((cartItem: ICartItem | ICreatePurchaseProduct) => {
      listProducts.push({
        productId: cartItem.productId,
        colorId: cartItem.colorId,
        customParameterId: cartItem.customParameterId,
        quantity: cartItem.quantity,
        type: LockingTypeEnum.STOCK
      });
    });

    const productInventoryStatus = await this.checkQuantityStockByProductsId(listProducts, userId);

    return productInventoryStatus;
  }

  async validateWithLockingItems(userId: number, purchaseProducts: IProductInventoryValidation[]): Promise<OrderItemInventoryStatusEnum> {
    const purchaseProductIds = purchaseProducts.map(product => product.productId);

    const [allLockingOrderItems, products] = await Promise.all([
      this.services.orderingItemsService.getAllLockedItemsByProductIds(purchaseProductIds, undefined, {
        order: [['id', 'ASC']]
      }),
      this.services.productRepository.findAll({
        where: { id: purchaseProductIds },
        include: [parameterSets]
      })
    ]);

    for (const purchaseProduct of purchaseProducts) {
      const product = products.find(p => p.id === purchaseProduct.productId);

      if (
        !product ||
        (purchaseProduct.type === LockingTypeEnum.STOCK && product.stock === 0) ||
        (purchaseProduct.type === LockingTypeEnum.SHIP_LATER_STOCK && product.shipLaterStock === 0)
      ) {
        return OrderItemInventoryStatusEnum.OUT_OF_STOCK;
      }

      if (purchaseProduct.type === LockingTypeEnum.STOCK && (product.stock === null || product.stock === undefined)) {
        // product unlimited in stock
        continue;
      }

      let validateResult = OrderItemInventoryStatusEnum.INSTOCK;
      if (product.hasParameters) {
        validateResult = this.validateProductParameterWithLockingItems(userId, purchaseProduct, product, allLockingOrderItems);
      } else {
        validateResult = this.validateProductWithLockingItem(userId, purchaseProduct, product, allLockingOrderItems);
      }

      if (validateResult !== OrderItemInventoryStatusEnum.INSTOCK) {
        return validateResult;
      }
    }

    return OrderItemInventoryStatusEnum.INSTOCK;
  }

  async loadMainProductStockQuantity(products: IProductModel[], userId?: number): Promise<void> {
    const productIds = products.map(product => product.id);

    const allLockingOrderItems = await this.services.orderingItemsService.getAllLockedItemsByProductIds(productIds, userId, {
      order: [['id', 'ASC']]
    });

    products.forEach(product => {
      if (product.stock) {
        const totalLockingItemQuantity = allLockingOrderItems
          .filter(lockingItem => lockingItem.productId === product.id)
          .reduce((sum: number, lockingItem) => sum + lockingItem.quantity, 0);

        const remainingQuantity = product.stock - totalLockingItemQuantity;
        product.stock = remainingQuantity > 0 ? remainingQuantity : 0;
      }
    });
  }

  async loadProductStockQuantity(products: IProductDao[], userId?: number): Promise<void> {
    const productIds = products.map(product => product.id);

    const allLockingOrderItems = await this.services.orderingItemsService.getAllLockedItemsByProductIds(productIds, userId, {
      order: [['id', 'ASC']]
    });

    products.forEach(product => {
      if (product.stock) {
        const totalLockingItemQuantity = allLockingOrderItems
          .filter(lockingItem => lockingItem.productId === product.id && lockingItem.type === LockingTypeEnum.STOCK)
          .reduce((sum: number, lockingItem) => sum + lockingItem.quantity, 0);

        const remainingQuantity = product.stock - totalLockingItemQuantity;
        product.stock = remainingQuantity > 0 ? remainingQuantity : 0;
      }

      if (product.salesMethod === SalesMethodEnum.INSTORE && product.shipLaterStock) {
        const totalLockingShipLaterItems = allLockingOrderItems
          .filter(lockingItem => lockingItem.productId === product.id && lockingItem.type === LockingTypeEnum.SHIP_LATER_STOCK)
          .reduce((sum: number, lockingItem) => sum + lockingItem.quantity, 0);

        const remainingShipLaterStock = product.shipLaterStock - totalLockingShipLaterItems;
        product.shipLaterStock = remainingShipLaterStock > 0 ? remainingShipLaterStock : 0;
      }

      if (product.hasParameters && product.parameterSets) {
        for (const parameterSet of product.parameterSets) {
          if (parameterSet.stock) {
            const totalLockingItemQuantity = allLockingOrderItems
              .filter(
                lockingItem =>
                  lockingItem.productId === product.id &&
                  lockingItem.color === parameterSet.colorId &&
                  lockingItem.customParameter === parameterSet.customParameterId &&
                  lockingItem.type === LockingTypeEnum.STOCK
              )
              .reduce((sum: number, lockingItem) => sum + lockingItem.quantity, 0);

            const remainingQuantity = parameterSet.stock - totalLockingItemQuantity;
            parameterSet.stock = remainingQuantity > 0 ? remainingQuantity : 0;
          }

          if (product.salesMethod === SalesMethodEnum.INSTORE && parameterSet.shipLaterStock) {
            const totalLockingShipLaterItems = allLockingOrderItems
              .filter(
                lockingItem =>
                  lockingItem.productId === product.id &&
                  lockingItem.color === parameterSet.colorId &&
                  lockingItem.customParameter === parameterSet.customParameterId &&
                  lockingItem.type === LockingTypeEnum.SHIP_LATER_STOCK
              )
              .reduce((sum: number, lockingItem) => sum + lockingItem.quantity, 0);

            const remainingShipLaterStock = parameterSet.shipLaterStock - totalLockingShipLaterItems;
            parameterSet.shipLaterStock = remainingShipLaterStock > 0 ? remainingShipLaterStock : 0;
          }
        }
      }
    });
  }

  async loadAvailabeStock(product: IProductDao, userId?: number, orderId?: number): Promise<void> {
    product.stock = await this.services.orderingItemsService.getStockAfterMinusOrdering(
      product.id,
      LockingTypeEnum.STOCK,
      null,
      null,
      product.stock,
      userId,
      orderId
    );

    if (product.salesMethod === SalesMethodEnum.INSTORE) {
      product.shipLaterStock = await this.services.orderingItemsService.getStockAfterMinusOrdering(
        product.id,
        LockingTypeEnum.SHIP_LATER_STOCK,
        null,
        null,
        product.shipLaterStock,
        userId,
        orderId
      );
    }
    for (const parameterSet of product.parameterSets) {
      if (parameterSet.enable) {
        parameterSet.stock = await this.services.orderingItemsService.getStockAfterMinusOrdering(
          product.id,
          LockingTypeEnum.STOCK,
          parameterSet.colorId,
          parameterSet.customParameterId,
          parameterSet.stock,
          userId,
          orderId
        );
        if (product.salesMethod === SalesMethodEnum.INSTORE) {
          parameterSet.shipLaterStock = await this.services.orderingItemsService.getStockAfterMinusOrdering(
            product.id,
            LockingTypeEnum.SHIP_LATER_STOCK,
            parameterSet.colorId,
            parameterSet.customParameterId,
            parameterSet.shipLaterStock,
            userId,
            orderId
          );
        }
      }
    }
  }

  private async checkLowStock(productId: number, transaction?: Transaction): Promise<void> {
    const [product, lowNumberOfStock] = await Promise.all([
      this.services.productRepository.findOne({ where: { id: productId }, transaction }),
      this.services.configRepository.getLowNumberOfStock()
    ]);

    if (product.stock !== undefined && product.stock !== null && product.stock <= lowNumberOfStock) {
      log.verbose(`latest quantity in stock of product id ${productId} is ${product.stock}`);

      const existingLowStockNotification = await this.services.lowStockProductNotificationRepository.findOne({
        where: {
          productId,
          notifiedAt: { [Op.is]: null } as any
        }
      });

      if (!existingLowStockNotification) {
        await this.services.lowStockProductNotificationRepository.create({ productId }, { transaction });
      }
    }
  }

  private async removeLowStockProductNotification(productId: number, stock?: number | null, transaction?: Transaction): Promise<void> {
    const lowNumberOfStock = await this.services.configRepository.getLowNumberOfStock();

    if (stock === undefined || stock === null || stock > lowNumberOfStock) {
      await this.services.lowStockProductNotificationRepository.delete({
        where: {
          productId,
          notifiedAt: { [Op.is]: null } as any
        },
        transaction
      });
    }
  }

  private validateProductParameterWithLockingItems(
    userId: number,
    purchaseProduct: IProductInventoryValidation,
    productDetail: IProductDao,
    allLockingOrderItems: IOrderingItemsModel[]
  ): OrderItemInventoryStatusEnum {
    const productWithParameter = productDetail.parameterSets.find(
      parameterSet =>
        parameterSet.colorId === purchaseProduct.colorId &&
        parameterSet.customParameterId === purchaseProduct.customParameterId &&
        parameterSet.enable
    );

    if (
      !productWithParameter ||
      (purchaseProduct.type === LockingTypeEnum.STOCK && productWithParameter.stock === 0) ||
      (purchaseProduct.type === LockingTypeEnum.SHIP_LATER_STOCK && productWithParameter.shipLaterStock === 0)
    ) {
      return OrderItemInventoryStatusEnum.OUT_OF_STOCK;
    }

    if (
      purchaseProduct.type === LockingTypeEnum.STOCK &&
      (productWithParameter.stock === null || productWithParameter.stock === undefined)
    ) {
      // product unlimited in stock
      return OrderItemInventoryStatusEnum.INSTOCK;
    }

    const totalLockingItemQuantity = allLockingOrderItems.reduce((sum: number, lockingItem) => {
      if (
        lockingItem.productId === purchaseProduct.productId &&
        lockingItem.color === purchaseProduct.colorId &&
        lockingItem.customParameter === purchaseProduct.customParameterId &&
        lockingItem.type === purchaseProduct.type
      ) {
        return sum + lockingItem.quantity;
      }
      return sum;
    }, 0);

    const currentStockValue =
      (purchaseProduct.type === LockingTypeEnum.SHIP_LATER_STOCK ? productWithParameter.shipLaterStock : productWithParameter.stock) || 0;

    if (totalLockingItemQuantity > currentStockValue) {
      // total items in lock table > product in_stock amount AND Quantity Is within number of stocks when sorted by lock id
      let totalLockingQuantity = 0;
      allLockingOrderItems
        .filter(
          lockingItem =>
            lockingItem.productId === purchaseProduct.productId &&
            lockingItem.color === purchaseProduct.colorId &&
            lockingItem.customParameter === purchaseProduct.customParameterId &&
            lockingItem.type === purchaseProduct.type
        )
        .some(lockingItem => {
          totalLockingQuantity += lockingItem.quantity;
          if (lockingItem.userId === userId) {
            return true;
          }
        });

      if (totalLockingQuantity > currentStockValue) {
        return OrderItemInventoryStatusEnum.INSUFFICIENT;
      }
    }

    return OrderItemInventoryStatusEnum.INSTOCK;
  }

  private validateProductWithLockingItem(
    userId: number,
    purchaseProduct: IProductInventoryValidation,
    productDetail: IProductDao,
    allLockingOrderItems: IOrderingItemsModel[]
  ): OrderItemInventoryStatusEnum {
    if (
      !productDetail ||
      (purchaseProduct.type === LockingTypeEnum.STOCK && productDetail.stock === 0) ||
      (purchaseProduct.type === LockingTypeEnum.SHIP_LATER_STOCK && productDetail.shipLaterStock === 0)
    ) {
      return OrderItemInventoryStatusEnum.OUT_OF_STOCK;
    }

    if (purchaseProduct.type === LockingTypeEnum.STOCK && (productDetail.stock === null || productDetail.stock === undefined)) {
      // product unlimited in stock
      return OrderItemInventoryStatusEnum.INSTOCK;
    }

    const totalLockingItemQuantity = allLockingOrderItems
      .filter(lockingItem => lockingItem.type === purchaseProduct.type)
      .reduce((sum: number, lockingItem) => {
        if (lockingItem.productId === purchaseProduct.productId) {
          return sum + lockingItem.quantity;
        }
        return sum;
      }, 0);

    const currentStockValue =
      (purchaseProduct.type === LockingTypeEnum.SHIP_LATER_STOCK ? productDetail.shipLaterStock : productDetail.stock) || 0;

    if (totalLockingItemQuantity > currentStockValue) {
      // total items in lock table > product in_stock amount AND Quantity Is within number of stocks when sorted by lock id
      let totalLockingQuantity = 0;
      allLockingOrderItems
        .filter(lockingItem => lockingItem.productId === productDetail.id && lockingItem.type === purchaseProduct.type)
        .some(lockingItem => {
          totalLockingQuantity += lockingItem.quantity;
          if (lockingItem.userId === userId) {
            return true;
          }
        });

      if (totalLockingQuantity > currentStockValue) {
        return OrderItemInventoryStatusEnum.INSUFFICIENT;
      }
    }

    return OrderItemInventoryStatusEnum.INSTOCK;
  }
}

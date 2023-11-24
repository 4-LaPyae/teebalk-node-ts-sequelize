import _ from 'lodash';
import { Op, Transaction } from 'sequelize';

import { ProductEventEnum } from '../../constants';
import { IUpdateProductParameterSetModel } from '../../controllers/product/interfaces';
import { IProductDao, ProductAvailableNotificationRepository, ProductRepository } from '../../dal';
import { PRODUCT_RELATED_MODELS } from '../../dal/product/constants';
import { ProductStatusEnum } from '../../database';

import { AuditTypes } from './constants';
import { ProductEvents } from './product-events.service';

const { parameterSets } = PRODUCT_RELATED_MODELS;

export interface IAuditProductServiceDependencies {
  productRepository: ProductRepository;
  productAvailableNotificationRepository: ProductAvailableNotificationRepository;
  productEvents: ProductEvents;
}

export class AuditProductService {
  private dependencies: IAuditProductServiceDependencies;

  constructor(dependencies: IAuditProductServiceDependencies) {
    this.dependencies = dependencies;
  }

  async getProduct(productId: number) {
    const product = await this.dependencies.productRepository.getById(productId, {
      attributes: ['id', 'status', 'stock', 'hasParameters'],
      include: [parameterSets]
    });

    return product;
  }

  async auditProduct(auditType: AuditTypes, after: Partial<IProductDao>, transaction?: Transaction): Promise<void> {
    const productId = Number(after.id);
    const before = await this.getProduct(productId);

    if (AuditTypes.EDIT === auditType) {
      if (before.hasParameters && !after.hasParameters) {
        await this.deleteProductAvailableNotification(productId, undefined, undefined);
        if (before.status === ProductStatusEnum.PUBLISHED && (after.stock as number) > 0) {
          await this.insertProductAvailableNotification(productId, undefined, undefined);
        }
      }
    }

    if (after.hasParameters || (AuditTypes.EDIT !== auditType && before.hasParameters)) {
      await this.auditProductWithParameterSets(auditType, before, after, productId, transaction);
    } else {
      await this.auditProductWithoutParameterSets(auditType, before, after, productId, transaction);
    }
  }

  async auditProductParameterSets(productId: number, paramSets: Partial<IUpdateProductParameterSetModel>[], transaction?: Transaction) {
    const product = await this.getProduct(productId);
    if (product.hasParameters && product.status === ProductStatusEnum.PUBLISHED) {
      const oldParameterSets = product.parameterSets;
      const parameterSetNeedDelete = oldParameterSets.filter(x => !paramSets.map(p => p.id).includes(x.id));

      for (const parameterSet of parameterSetNeedDelete) {
        await this.deleteProductAvailableNotification(productId, parameterSet.colorId, parameterSet.customParameterId);
      }

      for (const parameterSet of paramSets) {
        const productIsAvailable = parameterSet.enable && (parameterSet.stock as number) > 0;
        if (productIsAvailable) {
          await this.insertProductAvailableNotification(productId, parameterSet.colorId, parameterSet.customParameterId);
        } else {
          await this.deleteProductAvailableNotification(productId, parameterSet.colorId, parameterSet.customParameterId);
        }
      }
    }
  }

  async setNotifiedProductAvailableNotifications(productIds: number[], transaction?: Transaction) {
    await this.dependencies.productAvailableNotificationRepository.update(
      { notifiedAt: new Date().toUTCString() },
      {
        where: {
          productId: productIds,
          notifiedAt: null
        },
        transaction
      }
    );
  }

  async getUnnotifiedAuditProducts(transaction?: Transaction) {
    const result = await this.dependencies.productAvailableNotificationRepository.findAll({
      where: {
        notifiedAt: null
      },
      transaction
    });

    return result;
  }

  private async auditProductWithoutParameterSets(
    auditType: AuditTypes,
    before: IProductDao,
    after: Partial<IProductDao>,
    productId: number,
    transaction: Transaction | undefined
  ) {
    if (
      AuditTypes.PUBLISH === auditType &&
      ((before.status === ProductStatusEnum.UNPUBLISHED && this.stockAvailable(after)) ||
        (before.status === ProductStatusEnum.PUBLISHED && this.stockUnavailable(before) && this.stockAvailable(after)))
    ) {
      await this.insertProductAvailableNotification(productId, undefined, undefined, transaction);
    }

    if (AuditTypes.UNPUBLISH === auditType) {
      await this.deleteProductAvailableNotification(productId, undefined, undefined, transaction);
    }

    if (AuditTypes.OUT_OF_STOCK === auditType) {
      await this.deleteProductAvailableNotification(productId, undefined, undefined, transaction);
    }

    if (AuditTypes.EDIT === auditType && ProductStatusEnum.PUBLISHED === before.status) {
      if (this.stockUnavailable(before) && this.stockAvailable(after)) {
        this.dependencies.productEvents.emit(ProductEventEnum.PRODUCT_AVAILABLE, productId);
        await this.insertProductAvailableNotification(productId, undefined, undefined, transaction);
      } else if (this.stockAvailable(before) && this.stockUnavailable(after)) {
        await this.deleteProductAvailableNotification(productId, undefined, undefined, transaction);
      }
    }
  }

  private async auditProductWithParameterSets(
    auditType: AuditTypes,
    before: IProductDao,
    after: Partial<IProductDao>,
    productId: number,
    transaction: Transaction | undefined
  ) {
    if (AuditTypes.PUBLISH === auditType) {
      await this.deleteProductAvailableNotification(productId, undefined, undefined);
      const productParameterSetsAvailable = before.parameterSets.filter(x => (x.stock as number) > 0 && x.enable);
      for (const product of productParameterSetsAvailable) {
        await this.insertProductAvailableNotification(productId, product.colorId, product.customParameterId, transaction);
      }
    }
    if (AuditTypes.UNPUBLISH === auditType) {
      await this.deleteProductAvailableNotification(productId, undefined, undefined, transaction);
    }
    if (AuditTypes.OUT_OF_STOCK === auditType) {
      await this.deleteProductAvailableNotification(productId, undefined, undefined, transaction);
    }
  }

  private async insertProductAvailableNotification(
    productId: number,
    colorId?: number,
    customParameterId?: number,
    transaction?: Transaction
  ) {
    const existingNotification = await this.dependencies.productAvailableNotificationRepository.findOne({
      where: {
        productId,
        ...(colorId ? { colorId } : {}),
        ...(customParameterId ? { customParameterId } : {}),
        notifiedAt: { [Op.is]: null } as any
      }
    });

    if (!existingNotification) {
      await this.dependencies.productAvailableNotificationRepository.create({ productId, colorId, customParameterId }, { transaction });
    }
  }

  private deleteProductAvailableNotification(productId: number, colorId?: number, customParameterId?: number, transaction?: Transaction) {
    return this.dependencies.productAvailableNotificationRepository.delete({
      where: {
        productId,
        ...(colorId ? { colorId } : {}),
        ...(customParameterId ? { customParameterId } : {}),
        notifiedAt: { [Op.is]: null } as any
      },
      transaction
    });
  }
  private stockAvailable(product: Partial<IProductDao>) {
    return product.stock === null || product.stock === undefined || product.stock > 0;
  }

  private stockUnavailable(product: Partial<IProductDao>) {
    return product.stock === 0;
  }
}

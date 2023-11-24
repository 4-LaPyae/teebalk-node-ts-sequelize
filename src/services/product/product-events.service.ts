import { EventEmitter } from 'events';

import { LogMethodSignature } from '@freewilltokyo/freewill-be';
import Logger from '@freewilltokyo/logger';
import autobind from 'autobind-decorator';

import { CartRepository } from '../../dal';
import { CartStatusEnum } from '../../database';

export interface IProductEvents {
  productAvailable(productId: number): Promise<void>;
}

const log = new Logger('SRV:ProductEvents');

@autobind
export class ProductEvents extends EventEmitter implements IProductEvents {
  private cartRepository: CartRepository;

  constructor(cartRepository: CartRepository) {
    super();
    this.cartRepository = cartRepository;
    log.info('ProductEvents Service initialized');
  }

  @LogMethodSignature(log)
  async productAvailable(productId: number): Promise<void> {
    await this.resetReadUnavailableCartItems(productId);
  }

  private async resetReadUnavailableCartItems(productId: number): Promise<void> {
    await this.cartRepository.update(
      { showUnavailableMessage: true },
      {
        where: {
          productId,
          status: [CartStatusEnum.IN_PROGRESS, CartStatusEnum.BUY_LATER],
          showUnavailableMessage: false
        }
      }
    );
  }
}

import Logger from '@freewilltokyo/logger';

import { IProductLabelResModel } from '../../controllers';
import { LogMethodSignature } from '../../logger';
import { ProductLabelService } from '../../services';
import { BaseController } from '../_base/base.controller';

const log = new Logger('CTR:ProductLabelController');

export interface IProductLabelControllerServices {
  productLabelService: ProductLabelService;
}

export class ProductLabelController extends BaseController<IProductLabelControllerServices> {
  @LogMethodSignature(log)
  getLabels(): Promise<IProductLabelResModel[]> {
    return this.services.productLabelService.getAllLabels();
  }
}

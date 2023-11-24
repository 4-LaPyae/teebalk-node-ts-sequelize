import Logger from '@freewilltokyo/logger';
import * as uuid from 'uuid';

import { UploadUrlGroupEnum } from '../../constants';
import { LogMethodSignature } from '../../logger';
import { S3Service } from '../../services';
import { BaseController } from '../_base/base.controller';

const log = new Logger('CTR:UploadController');

interface IUploadControllerServices {
  s3Service: S3Service;
}

export class UploadController extends BaseController<IUploadControllerServices> {
  @LogMethodSignature(log)
  async createUploadUrl(type: UploadUrlGroupEnum) {
    let key: string;
    switch (type) {
      case UploadUrlGroupEnum.PRODUCT_IMAGE:
        key = `public/product/images/${uuid.v1()}`;
        break;
      case UploadUrlGroupEnum.PRODUCT_STORY_IMAGE:
        key = `public/product_story/images/${uuid.v1()}`;
        break;
      case UploadUrlGroupEnum.SHOP_IMAGE:
        key = `public/shop/images/${uuid.v1()}`;
        break;
      case UploadUrlGroupEnum.USER_PROFILE_IMAGE:
        key = `public/user_profile/images/${uuid.v1()}`;
        break;
      case UploadUrlGroupEnum.EXPERIENCE_IMAGE:
        key = `public/experience/images/${uuid.v1()}`;
        break;
      default:
        throw new Error('Invalid parameter "type"');
    }

    const uploadPath: string = await this.services.s3Service.createUploadUrl(key, true);

    const data = {
      uploadPath,
      path: uploadPath.split('?')[0]
    };

    return [data];
  }
}

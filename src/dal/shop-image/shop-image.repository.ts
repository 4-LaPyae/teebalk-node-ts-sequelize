import { Op, Transaction } from 'sequelize';

import { IShopImageModel, ShopImageDbModel } from '../../database/models';
import { BaseRepository, IRepository } from '../_base';

export interface IShopImageRepository extends IRepository<IShopImageModel> {
  updateImagesByShopId(shopId: number, images: IShopImageModel[], transaction?: Transaction): Promise<void>;
}

export class ShopImageRepository extends BaseRepository<IShopImageModel> implements IShopImageRepository {
  constructor() {
    super(ShopImageDbModel);
  }

  /**
   * Update images for shop
   */
  async updateImagesByShopId(shopId: number, images: IShopImageModel[], transaction?: Transaction): Promise<void> {
    // Delete old image
    const imageIds = images.map(item => (item.id ? item.id : 0));
    await this.delete({
      where: {
        id: {
          [Op.notIn]: imageIds
        },
        shopId
      },
      transaction
    });

    // Update & create new image
    if (images) {
      const newImages: IShopImageModel[] = [];
      const updateImages = [];

      for (const image of images) {
        if (!image.id) {
          newImages.push({
            ...image,
            shopId
          });
        } else {
          updateImages.push(this.update(image, { where: { id: image.id, shopId }, transaction }));
        }
      }

      await Promise.all([...updateImages, this.bulkCreate(newImages, { transaction })]);
    }
  }
}

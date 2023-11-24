import { ShopContentDbModel, ShopDbModel, ShopImageDbModel, ShopStatusEnum } from '../../../src/database';
import { generateNameId } from '../../../src/helpers';

import { userId } from '../constants';

export const createTestShop = async (sellerId: number = userId) => {
    const shopData = {
        nameId: generateNameId(),
        userId: sellerId,
        platformPercents: 5,
        minAmountFreeShippingDomestic: 1000,
        minAmountFreeShippingOverseas: 2000,
        isFeatured: true,
        status: ShopStatusEnum.PUBLISHED,
        email: 'test@email.com'
    };

    const shop = await ShopDbModel.create(shopData) as any;

    const shopContentData = {
        shopId: shop.id,
        title: 'test shop content',
        description: 'test',
        subTitle: 'Hello!!!',
        policy: "<p>Hello!!!</p>"
    };

    const shopImageData = {
        id: 0,
        shopId: shop.id,
        imageDescription: "image description",
        imagePath: "some image path",
        isOrigin: 1
    };
    
    await ShopContentDbModel.create(shopContentData);
    await ShopImageDbModel.create(shopImageData);

    return shop;
};

export const clearTestShopDataById = async (shopIds: number[]) => {
    await Promise.all([
        ShopContentDbModel.destroy({
            where: { shopId: shopIds },
            force: true
        }),

        ShopImageDbModel.destroy({
            where: { shopId: shopIds },
            force: true
        }),

        ShopDbModel.destroy({
            where: { id: shopIds },
            force: true
        })
    ]);
};

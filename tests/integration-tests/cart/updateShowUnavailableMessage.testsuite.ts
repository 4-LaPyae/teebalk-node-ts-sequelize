import {
    CartDbModel,
    ProductColorDbModel,
    ProductContentDbModel,
    ProductCustomParameterDbModel,
    ProductDbModel,
    ProductImageDbModel,
    ProductPatternDbModel,
    ProductStatusEnum
} from '../../../src/database/models';

import { LanguageEnum } from '../../../src/constants';

const request = require('supertest');

const app = require('../index');

export const testTurnOffUnavailableMessage = () => {

    describe('Cart - update showUnavailableMessage', () => {

        let product: any, productColor: any, cart: any,
            productPattern: any, productCustomParameter: any;
        let userToken: string;

        beforeAll(async () => {
            const productData = {
                userId: 9999,
                shopId: 1,
                nameId: 'nameId 1',
                status: ProductStatusEnum.UNPUBLISHED,
                price: 100,
            };

            product = await ProductDbModel.create(productData);

            const productColorData = {
                productId: product.id,
                color: 'Blue',
                displayPosition: 0,
                isOrigin: true
            };

            const productPatternData = {
                productId: product.id,
                pattern: 'Dot',
                displayPosition: 0,
                isOrigin: true
            };

            const productCustomParameterData = {
                productId: product.id,
                customParameter: '[Logo] Tells',
                displayPosition: 0,
                isOrigin: true
            };

            const productImageData = {
                productId: product.id,
                imagePath: 'http://localhost:9000',
                imageDescription: '',
                isOrigin: true,
                language: LanguageEnum.ENGLISH
            };

            const productContentData = {
                productId: product.id,
                title: 'Product Title',
                subTitle: '',
                description: '',
                annotation: '',
                isOrigin: true,
                language: LanguageEnum.ENGLISH
            };

            productColor = await ProductColorDbModel.create(productColorData);
            productPattern = await ProductPatternDbModel.create(productPatternData);
            productCustomParameter = await ProductCustomParameterDbModel.create(productCustomParameterData);
            await ProductImageDbModel.create(productImageData);
            await ProductContentDbModel.create(productContentData);
            const cartData = {
                userId: 9999,
                productId: product.id,
                colorId: productColor.id,
                patternId: productPattern.id,
                customParameterId: productCustomParameter.id,
                quantity: 7,
                showUnavailableMessage: true
            };

            cart = await CartDbModel.create(cartData);
            userToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2NjY3NzMyLCJleHAiOjE2MTY3NTQxMzJ9.zJz6fL9uS2rqiueHWgf-9semQGmprkrXIMqotfbfSfs';
        });

        afterAll(async () => {
            await ProductDbModel.destroy({
                where: { id: product.id },
                force: true
            });
            await ProductColorDbModel.destroy({
                where: { productId: product.id },
                force: true
            });
            await ProductPatternDbModel.destroy({
                where: { productId: product.id },
                force: true
            });
            await ProductCustomParameterDbModel.destroy({
                where: { productId: product.id },
                force: true
            });
            await ProductImageDbModel.destroy({
                where: { productId: product.id },
                force: true
            });
            await ProductContentDbModel.destroy({
                where: { productId: product.id },
                force: true
            });
            await CartDbModel.destroy({
                where: { productId: product.id },
                force: true
            });
        });



        it('should update field showUnavailableMessage = false', async () => {
            const res = await request(app)
                .post(`/api/v1/cart/remove-unavailable-message`)
                .set('Authorization', `Bearer ${userToken}`)
                .send([cart.id]);

            expect(res.statusCode).toEqual(200)

            var cartItem = await CartDbModel.findOne({
                where: { id: cart.id }
            }) as any;

            expect(cartItem.showUnavailableMessage).toEqual(false);

        })

        it('should response `Bad request` when cardItemIds invalid format', async () => {
            const res = await request(app)
                .post(`/api/v1/cart/remove-unavailable-message`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(['this is invalid number']);

            expect(res.statusCode).toEqual(400)

        })

        it('should response `Not Found` when cartItems not belong to user`', async () => {

            await CartDbModel.update({ userId: 1 }, { where: { id: cart.id } });

            const res = await request(app)
                .post(`/api/v1/cart/remove-unavailable-message`)
                .set('Authorization', `Bearer ${userToken}`)
                .send([cart.id]);

            expect(res.statusCode).toEqual(404)

        })


    })
}
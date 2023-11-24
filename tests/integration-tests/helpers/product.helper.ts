import {
  OrderingItemsDbModel,
  ProductCategoryDbModel,
  ProductColorDbModel,
  ProductContentDbModel,
  ProductCustomParameterDbModel,
  ProductDbModel,
  ProductHighlightPointDbModel,
  ProductImageDbModel,
  ProductInventoryDbModel,
  ProductLocationDbModel,
  ProductMaterialDbModel,
  ProductParameterSetDbModel,
  ProductParameterSetImageDbModel,
  ProductPatternDbModel,
  ProductProducerDbModel,
  ProductRegionalShippingFeesDbModel,
  ProductShippingFeesDbModel,
  ProductStoryDbModel,
  ProductTransparencyDbModel
} from '../../../src/database/models';


export const clearProductDataByIds = async (productIds: number[]) => {

  const parameterSets = await ProductParameterSetDbModel.findAll({ 
    where: { productId: productIds },
    attributes: ['id']
  });

  const parameterSetIds = parameterSets.map(parameterSet => (parameterSet as any).id);

  await Promise.all([
    OrderingItemsDbModel.destroy({
      where: { productId: productIds },
      force: true
    }),

    ProductParameterSetImageDbModel.destroy({
      where: { parameterSetId: parameterSetIds },
      force: true
    }),

    ProductParameterSetDbModel.destroy({
      where: { productId: productIds },
      force: true
    }),

    ProductCategoryDbModel.destroy({
      where: { productId: productIds },
      force: true
    }),

    ProductTransparencyDbModel.destroy({
      where: { productId: productIds },
      force: true
    }),

    ProductHighlightPointDbModel.destroy({
      where: { productId: productIds },
      force: true
    }),

    ProductProducerDbModel.destroy({
      where: { productId: productIds },
      force: true
    }),

    ProductStoryDbModel.destroy({
      where: { productId: productIds },
      force: true
    }),

    ProductMaterialDbModel.destroy({
      where: { productId: productIds },
      force: true
    }),

    ProductImageDbModel.destroy({
      where: { productId: productIds },
      force: true
    }),

    ProductLocationDbModel.destroy({
      where: { productId: productIds },
      force: true
    }),

    ProductContentDbModel.destroy({
      where: { productId: productIds },
      force: true
    }),

    ProductShippingFeesDbModel.destroy({
      where: { productId: productIds },
      force: true
    }),

    ProductRegionalShippingFeesDbModel.destroy({
      where: { productId: productIds },
      force: true
    }),

    ProductInventoryDbModel.destroy({
      where: { productId: productIds },
      force: true
    })
  ]);

  await ProductColorDbModel.destroy({
    where: { productId: productIds },
    force: true
  });

  await ProductPatternDbModel.destroy({
    where: { productId: productIds },
    force: true
  });

  await ProductCustomParameterDbModel.destroy({
    where: { productId: productIds },
    force: true
  });

  await ProductDbModel.destroy({
    where: { id: productIds },
    force: true
  });
}

export const clearProductDataByNameIds = async (nameIds: string[]) => {
  const createdProductsList = await ProductDbModel.findAll({
    where: {
      nameId: nameIds
    },
    attributes: ['id']
  });

  const productIds: number[] = createdProductsList.map(item => {
    return (item as any).id;
  });

  await clearProductDataByIds(productIds);
}

import * as Joi from 'joi';
import _ from 'lodash';

import { ALLOW_ALPHANUMERIC_WITHOUT_NUM_ONLY_REGEX } from '../constants';
import { ProductStatusEnum } from '../database';

import { LanguageSchema } from './request.schema';

export const ProductNameIdSchema = Joi.string()
  .trim()
  .regex(ALLOW_ALPHANUMERIC_WITHOUT_NUM_ONLY_REGEX)
  .min(1)
  .max(30);

export const ProductStatusSchema = Joi.string()
  .valid(Object.values(ProductStatusEnum))
  .label('status');

export const ProductIdSchema = Joi.number()
  .integer()
  .min(1)
  .required();

export enum TopProductTypeEnum {
  TOP_PRODUCT = 'products',
  TOP_TRANSPARENCY = 'transparency',
  TOP_ETHICAL = 'ethical',
  TOP_COMMERCIAL = 'commercial'
}

export const TopTypeParamsSchema = Joi.object({
  type: Joi.string()
    .valid(Object.values(TopProductTypeEnum))
    .required()
})
  .required()
  .label('params');

export const getProductNameIdParameterSchema = (keyNames: string[] = ['nameId']) =>
  Joi.object(
    keyNames.reduce((acc: any, keyName: string) => {
      acc[keyName] = ProductNameIdSchema;
      return acc;
    }, {})
  )
    .required()
    .label('parameters');

export const ProductNameIdParameterSchema = getProductNameIdParameterSchema();

export const getProductIdParameterSchema = (keyNames: string[] = ['id']) =>
  Joi.object(
    keyNames.reduce((acc: any, keyName: string) => {
      acc[keyName] = ProductIdSchema;
      return acc;
    }, {})
  )
    .required()
    .label('parameters');

export const ProductIdParameterSchema = getProductIdParameterSchema();

export const ProductContentSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(300)
    .allow([null, '']),
  label: Joi.string()
    .trim()
    .max(300)
    .allow([null, '']),
  subTitle: Joi.string()
    .trim()
    .max(300)
    .allow([null, '']),
  description: Joi.string()
    .trim()
    .max(500)
    .allow([null, '']),
  annotation: Joi.string()
    .trim()
    .max(100)
    .allow([null, '']),
  isOrigin: Joi.boolean()
});

export const ProductColorSchema = Joi.object({
  color: Joi.string()
    .trim()
    .max(30)
    .allow([null, '']),
  displayPosition: Joi.number()
    .integer()
    .min(0),
  isOrigin: Joi.boolean()
});

export const ProductColorDataSchema = Joi.object({
  id: Joi.number().optional(),
  color: Joi.string()
    .trim()
    .max(30)
    .required(),
  displayPosition: Joi.number()
    .integer()
    .min(0),
  isOrigin: Joi.boolean(),
  language: LanguageSchema
});

export const ProductPatternSchema = Joi.object({
  pattern: Joi.string()
    .trim()
    .max(30)
    .allow([null, '']),
  displayPosition: Joi.number()
    .integer()
    .min(0),
  isOrigin: Joi.boolean()
});

export const ProductCustomParameterSchema = Joi.object({
  customParameter: Joi.string()
    .trim()
    .max(30)
    .allow([null, '']),
  displayPosition: Joi.number()
    .integer()
    .min(0),
  isOrigin: Joi.boolean()
});

export const ProductCustomParameterDataSchema = Joi.object({
  id: Joi.number().optional(),
  customParameter: Joi.string()
    .trim()
    .max(30)
    .required(),
  displayPosition: Joi.number()
    .integer()
    .min(0),
  isOrigin: Joi.boolean(),
  language: LanguageSchema
});

export const ProductMaterialSchema = Joi.object({
  id: Joi.number().optional(),
  material: Joi.string()
    .trim()
    .max(30)
    .allow([null, '']),
  percent: Joi.number()
    .integer()
    .min(0)
    .max(100),
  displayPosition: Joi.number()
    .integer()
    .min(0),
  isOrigin: Joi.boolean()
});

export const ProductStorySchema = Joi.object({
  content: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextContent: Joi.string()
    .trim()
    .allow([null, '']),
  summaryContent: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextSummaryContent: Joi.string()
    .trim()
    .allow([null, '']),
  isOrigin: Joi.boolean()
});

export const ProductImageSchema = Joi.object({
  imagePath: Joi.string()
    .trim()
    .min(0)
    .max(300),
  imageDescription: Joi.string()
    .trim()
    .max(100)
    .allow([null, '']),
  isOrigin: Joi.boolean()
});

export const ProductStoryImageSchema = Joi.object({
  imagePath: Joi.string()
    .trim()
    .min(0)
    .max(300),
  imageDescription: Joi.string()
    .trim()
    .max(100)
    .allow([null, '']),
  isOrigin: Joi.boolean()
});

export const ProductLocationSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1),
  place: Joi.string()
    .trim()
    .min(0)
    .max(300)
    .allow([null, '']),
  placeId: Joi.string()
    .trim()
    .allow([null, '']),
  description: Joi.string()
    .trim()
    .allow([null, ''])
    .max(300),
  city: Joi.string()
    .trim()
    .allow([null, ''])
    .max(100),
  country: Joi.string()
    .trim()
    .allow([null, ''])
    .max(100),
  isOrigin: Joi.boolean()
});

export const ProductProducerSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(0),
  name: Joi.string()
    .trim()
    .max(50)
    .allow([null, '']),
  position: Joi.string()
    .trim()
    .max(50)
    .allow([null, '']),
  comment: Joi.string()
    .trim()
    .max(300)
    .allow([null, '']),
  photo: Joi.string()
    .trim()
    .max(1000)
    .allow([null, '']),
  displayPosition: Joi.number()
    .integer()
    .min(0),
  isOrigin: Joi.boolean(),
  language: LanguageSchema
});

export const ArrayProductProducersSchema = Joi.array()
  .items(ProductProducerSchema)
  .unique((a, b) => a.displayPosition === b.displayPosition);

export const ArrayProductColorsDataSchema = Joi.array()
  .items(ProductColorDataSchema)
  .unique((a, b) => a.displayPosition === b.displayPosition);

export const ArrayProductCustomParametersDataSchema = Joi.array()
  .items(ProductCustomParameterDataSchema)
  .unique((a, b) => a.displayPosition === b.displayPosition);

export const ProductTransparencySchema = Joi.object({
  id: Joi.number().optional(),
  sdgs: Joi.array().items(
    Joi.number()
      .integer()
      .min(1)
  ),
  ethicalLevel: Joi.number()
    .integer()
    .allow([null]),
  recycledMaterialPercent: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .allow([null]),
  location: ProductLocationSchema,
  materials: Joi.array()
    .items(ProductMaterialSchema)
    .unique((a, b) => a.displayPosition === b.displayPosition),
  producers: ArrayProductProducersSchema,
  materialNaturePercent: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .allow([null]),
  recycledMaterialDescription: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextRecycledMaterialDescription: Joi.string()
    .trim()
    .max(1000)
    .allow([null, '']),
  sdgsReport: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextSdgsReport: Joi.string()
    .trim()
    .max(1000)
    .allow([null, '']),
  contributionDetails: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextContributionDetails: Joi.string()
    .trim()
    .max(1000)
    .allow([null, '']),
  effect: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextEffect: Joi.string()
    .trim()
    .max(1000)
    .allow([null, '']),
  culturalProperty: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextCulturalProperty: Joi.string()
    .trim()
    .max(1000)
    .allow([null, '']),
  rarenessLevel: Joi.number()
    .integer()
    .min(1)
    .allow(null),
  rarenessDescription: Joi.string()
    .trim()
    .max(300)
    .allow([null, '']),
  highlightPoints: Joi.array().items(
    Joi.number()
      .integer()
      .min(1)
  ),
  isOrigin: Joi.boolean()
});

export const ProductParameterSetImagesSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1),
  parameterSetId: Joi.number()
    .integer()
    .min(1),
  imagePath: Joi.string()
    .trim()
    .max(50)
});

export const ProductRegionalShippingFeesSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1),
  productId: Joi.number()
    .integer()
    .min(1),
  prefectureCode: Joi.string()
    .trim()
    .max(50)
    .required(),
  shippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .required()
});

export const ArrayProductRegionalShippingFeesSchema = Joi.array()
  .allow(null)
  .items(ProductRegionalShippingFeesSchema);

export const ArrayProductParameterSetImagesSchema = Joi.array()
  .allow(null)
  .items(ProductParameterSetImagesSchema);

export const ProductShippingFeesSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1),
  quantityFrom: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required(),
  quantityTo: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required(),
  shippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999)
    .required(),
  overseasShippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999)
    .required(),
  regionalShippingFees: ArrayProductRegionalShippingFeesSchema
});

export const ProductParameterSetsSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1),
  productId: Joi.number()
    .integer()
    .min(1),
  colorId: Joi.number()
    .integer()
    .min(1)
    .allow(null),
  customParameterId: Joi.number()
    .integer()
    .min(1)
    .allow(null),
  price: Joi.number()
    .integer()
    .min(0)
    .max(99999999)
    .allow(null),
  stock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null),
  shipLaterStock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null),
  enable: Joi.boolean(),
  parameterSetImages: ArrayProductParameterSetImagesSchema
});

export const ArrayProductShippingFeesSchema = Joi.array()
  .allow(null)
  .items(ProductShippingFeesSchema);

export const ArrayProductParameterSchema = Joi.array()
  .allow(null)
  .items(ProductParameterSetsSchema);

export const ProductBodySchema = Joi.object({
  coordinate: Joi.object({
    lat: Joi.number()
      .allow(null)
      .min(-90)
      .max(90),
    lng: Joi.number()
      .allow(null)
      .min(-180)
      .max(180)
  }),
  nameId: Joi.string().trim(),
  language: LanguageSchema,
  price: Joi.number()
    .integer()
    .min(0)
    .max(99999999)
    .allow(null),
  stock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null),
  categoryId: Joi.number()
    .integer()
    .min(0),
  labelId: Joi.number()
    .integer()
    .min(0),
  productWeight: Joi.number()
    .integer()
    .min(0)
    .max(10000)
    .allow(null),
  isShippingFeesEnabled: Joi.boolean()
    .allow(null)
    .optional(),
  isFreeShipment: Joi.boolean().allow(null),
  content: ProductContentSchema,
  story: ProductStorySchema,
  images: Joi.array().items(ProductImageSchema),
  colors: Joi.array()
    .items(ProductColorSchema)
    .unique((a, b) => _.toLower(a.color) === _.toLower(b.color))
    .unique((a, b) => a.displayPosition === b.displayPosition),
  customParameters: Joi.array()
    .items(ProductCustomParameterSchema)
    .unique((a, b) => _.toLower(a.customParameter) === _.toLower(b.customParameter))
    .unique((a, b) => a.displayPosition === b.displayPosition),
  patterns: Joi.array()
    .items(ProductPatternSchema)
    .unique((a, b) => _.toLower(a.pattern) === _.toLower(b.pattern))
    .unique((a, b) => a.displayPosition === b.displayPosition),
  transparency: ProductTransparencySchema,
  shippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999),
  allowInternationalOrders: Joi.boolean(),
  overseasShippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999),
  regionalShippingFees: ArrayProductRegionalShippingFeesSchema,
  shippingFees: ArrayProductShippingFeesSchema,
  hasParameters: Joi.boolean(),
  parameterSets: ArrayProductParameterSchema
})
  .required()
  .label('body');

export const ArrayProductColorsSchema = Joi.array()
  .items(
    ProductColorSchema.keys({
      id: Joi.number()
        .integer()
        .min(1)
    })
  )
  .unique((a, b) => _.toLower(a.color) === _.toLower(b.color))
  .unique((a, b) => a.displayPosition === b.displayPosition);

export const ArrayProductPatternsSchema = Joi.array()
  .items(
    ProductPatternSchema.keys({
      id: Joi.number()
        .integer()
        .min(1)
    })
  )
  .unique((a, b) => _.toLower(a.pattern) === _.toLower(b.pattern))
  .unique((a, b) => a.displayPosition === b.displayPosition);

export const ArrayProductCustomParametersSchema = Joi.array()
  .items(
    ProductCustomParameterSchema.keys({
      id: Joi.number()
        .integer()
        .min(1)
    })
  )
  .unique((a, b) => _.toLower(a.customParameter) === _.toLower(b.customParameter))
  .unique((a, b) => a.displayPosition === b.displayPosition);

export const ArrayProductMaterialsSchema = Joi.array()
  .items(
    ProductMaterialSchema.keys({
      id: Joi.number()
        .integer()
        .min(1)
    })
  )
  .unique((a, b) => a.displayPosition === b.displayPosition);

export const UpdateProductBodySchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1),
  shopId: Joi.number()
    .integer()
    .min(1),
  content: ProductContentSchema,
  price: Joi.number()
    .integer()
    .min(0)
    .max(99999999)
    .allow(null),
  stock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null),
  story: ProductStorySchema.keys({
    id: Joi.number()
      .integer()
      .min(1)
  }),
  images: Joi.array().items(
    ProductImageSchema.keys({
      id: Joi.number()
        .integer()
        .min(1)
    })
  ),
  categoryId: Joi.number()
    .integer()
    .min(0),
  labelId: Joi.number()
    .integer()
    .min(0),
  productWeight: Joi.number()
    .integer()
    .min(0)
    .max(10000)
    .allow(null),
  language: LanguageSchema,
  isShippingFeesEnabled: Joi.boolean()
    .allow(null)
    .optional(),
  isFreeShipment: Joi.boolean().allow(null),
  colors: ArrayProductColorsSchema,
  customParameters: ArrayProductCustomParametersSchema,
  patterns: ArrayProductPatternsSchema,
  materials: ArrayProductMaterialsSchema,
  producers: ArrayProductProducersSchema,
  transparency: ProductTransparencySchema.keys({
    id: Joi.number()
      .integer()
      .min(0)
  }),
  coordinate: Joi.object({
    lat: Joi.number()
      .allow(null)
      .min(-90)
      .max(90),
    lng: Joi.number()
      .allow(null)
      .min(-180)
      .max(180)
  }),
  shippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999),
  allowInternationalOrders: Joi.boolean(),
  overseasShippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999),
  regionalShippingFees: ArrayProductRegionalShippingFeesSchema,
  shippingFees: ArrayProductShippingFeesSchema,
  hasParameters: Joi.boolean(),
  parameterSets: ArrayProductParameterSchema
})
  .required()
  .label('body');

export const ProductContentRequiredFieldsSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(300)
    .required(),
  description: Joi.string()
    .trim()
    .max(500)
    .required(),
  subTitle: Joi.string()
    .trim()
    .max(300)
    .allow([null, '']),
  annotation: Joi.string()
    .trim()
    .max(100)
    .allow([null, '']),
  isOrigin: Joi.boolean()
});

export const ArrayProductImagesRequiredFieldsSchema = Joi.array()
  .min(1)
  .items(
    Joi.object({
      id: Joi.number()
        .integer()
        .min(1),
      imagePath: Joi.string()
        .trim()
        .min(0)
        .max(300)
        .required(),
      imageDescription: Joi.string()
        .trim()
        .max(100)
        .allow([null, '']),
      isOrigin: Joi.boolean()
    })
  );

export const ProductStoryRequireFieldsSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1),
  content: Joi.string()
    .trim()
    .allow([null, ''])
    .optional(),
  plainTextContent: Joi.string()
    .trim()
    .allow([null, ''])
    .optional(),
  summaryContent: Joi.string()
    .trim()
    .required(),
  plainTextSummaryContent: Joi.string()
    .trim()
    .allow([null, ''])
    .optional(),
  isOrigin: Joi.boolean()
});

export const ArrayProductProducerRequiredFieldsSchema = Joi.array()
  .min(0)
  .items(
    Joi.object({
      id: Joi.number()
        .integer()
        .min(1),
      name: Joi.string()
        .trim()
        .max(50)
        .required(),
      position: Joi.string()
        .trim()
        .max(50)
        .required(),
      comment: Joi.string()
        .trim()
        .max(300)
        .required()
    })
  );

export const ProductRequiredFieldsBodySchema = Joi.object({
  categoryId: Joi.number()
    .integer()
    .min(1),
  labelId: Joi.number()
    .integer()
    .min(1),
  content: ProductContentRequiredFieldsSchema,
  price: Joi.number()
    .integer()
    .min(0)
    .max(99999999),
  stock: Joi.number()
    .integer()
    .min(0)
    .max(999999)
    .allow(null),
  images: ArrayProductImagesRequiredFieldsSchema,
  story: ProductStoryRequireFieldsSchema,
  productWeight: Joi.number()
    .integer()
    .min(0)
    .max(10000)
    .allow(null),
  language: LanguageSchema,
  isShippingFeesEnabled: Joi.boolean()
    .allow(null)
    .optional(),
  isFreeShipment: Joi.boolean(),
  colors: ArrayProductColorsSchema,
  customParameters: ArrayProductCustomParametersSchema,
  patterns: ArrayProductPatternsSchema,
  materials: ArrayProductMaterialsSchema,
  transparency: ProductTransparencySchema,
  coordinate: Joi.object({
    lat: Joi.number()
      .allow(null)
      .min(-90)
      .max(90),
    lng: Joi.number()
      .allow(null)
      .min(-180)
      .max(180)
  }),
  shippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999),
  allowInternationalOrders: Joi.boolean(),
  overseasShippingFee: Joi.number()
    .allow(null)
    .integer()
    .min(0)
    .max(99999999),
  regionalShippingFees: ArrayProductRegionalShippingFeesSchema,
  shippingFees: ArrayProductShippingFeesSchema,
  hasParameters: Joi.boolean()
})
  .required()
  .label('body');

export const ProductDisplayPositionSchema = Joi.object({
  nameId: Joi.string()
    .trim()
    .required(),
  displayPosition: Joi.number()
    .integer()
    .min(1)
    .required()
});

export const ArrayProductDisplayPositionSchema = Joi.array()
  .items(ProductDisplayPositionSchema)
  .unique((a, b) => a.displayPosition === b.displayPosition)
  .min(1)
  .required();

export const CloneInStoreProductFromOnlineProductBodySchema = Joi.object({
  ids: Joi.array()
    .min(1)
    .items(
      Joi.number()
        .integer()
        .min(1)
        .required()
    )
});

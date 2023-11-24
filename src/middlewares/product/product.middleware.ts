import Logger from '@freewilltokyo/logger';
import { NextFunction, Response } from 'express';
import * as Joi from 'joi';

import { ProductErrorMessageEnum } from '../../constants';
import { IProductShippingFeesModel, ProductStatusEnum, UserRoleEnum } from '../../database/models';
import { ApiError, TellsApiError, ValidationError } from '../../errors';
import {
  InStoreProductRequiredFieldsBodySchema,
  ProductRequiredFieldsBodySchema,
  ValidatePublishInstoreProductSchema
} from '../../schemas';
import { ProductService, ProductShippingFeesService } from '../../services';
import { IExtendedRequest, IRequestWithUser } from '../auth';

const log = new Logger('MDW:ProductAccessMiddleware');

/**
 * Requires both middlewares authTokenMiddleware & assetExistenceMiddleware allocated before this one
 */
export const productAccessMiddleware = (): any => (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const isAuthor = req.user?.id && req.state?.product?.userId === req.user.id;

    if (isAuthor) {
      log.silly('Author ID :', req.state?.product?.userId);
      return next();
    }

    if (req.state?.product?.status === ProductStatusEnum.PUBLISHED) {
      log.silly('Status :', req.state?.product?.status);

      if (!['GET'].includes(req.method)) {
        throw ApiError.forbidden();
      }

      return next();
    }

    throw ApiError.notFound();
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const isPublicProduct = (): any => (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    if (req.state?.product?.status !== ProductStatusEnum.PUBLISHED) {
      throw TellsApiError.conflict(ProductErrorMessageEnum.PRODUCT_WAS_ALREADY_UNPUBLISHED);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const checkShippingRanges = (shippingFees: IProductShippingFeesModel[]) => {
  for (let i = 0; i <= shippingFees.length - 1; i++) {
    if ((i === shippingFees.length - 1 && shippingFees[i].quantityTo < 10) || shippingFees[0].quantityFrom > 1) {
      throw TellsApiError.conflict(ProductErrorMessageEnum.MISSING_PRODUCT_SHIPPING_FEES_RANGES);
    }

    if (shippingFees[i].quantityFrom > shippingFees[i].quantityTo) {
      throw TellsApiError.conflict(ProductErrorMessageEnum.OVERLAP_PRODUCT_SHIPPING_FEES_RANGES);
    }

    if (shippingFees[i + 1]) {
      if (shippingFees[i].quantityTo >= shippingFees[i + 1].quantityFrom) {
        throw TellsApiError.conflict(ProductErrorMessageEnum.OVERLAP_PRODUCT_SHIPPING_FEES_RANGES);
      }

      if (shippingFees[i + 1].quantityFrom - shippingFees[i].quantityTo > 1) {
        throw TellsApiError.conflict(ProductErrorMessageEnum.MISSING_PRODUCT_SHIPPING_FEES_RANGES);
      }
    }
  }
};

export const onlineProductEditAvailableMiddleware = (productService: ProductService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = +req.params.id as any;

    const product = await productService.getOneOnlineProduct({
      where: { id: productId },
      attributes: ['id', 'nameId', 'userId', 'status', 'price', 'stock', 'hasParameters']
    });

    if (!product) {
      throw TellsApiError.conflict(ProductErrorMessageEnum.PRODUCT_IS_UNAVAILABLE_FOR_EDIT);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.product = product;

    if (product.status === ProductStatusEnum.DRAFT) {
      return next();
    }

    const mainSchema = Joi.object({
      body: Joi.any().optional()
    }).required();

    const result = mainSchema.keys({ body: ProductRequiredFieldsBodySchema }).validate({ body: req.body });
    if (result?.error) {
      if (result.error.details?.length) {
        log.warn('Request data is invalid. Reason : ' + result.error.details[0]?.message);
        return next(new ValidationError(result.error.details[0]?.message));
      }
      log.warn('Request data is invalid. Reason :', result.error);
      return next(new ValidationError('Invalid input data'));
    }

    if (req.body.hasParameters && product.parameterSets.length === 0) {
      throw ApiError.badRequest('Parameter sets should not be empty');
    }

    const shippingFees = req.body.shippingFees as IProductShippingFeesModel[];

    if (shippingFees) {
      checkShippingRanges(shippingFees);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const productPublishAvailableMiddleware = (
  productService: ProductService,
  productShippingFeesService: ProductShippingFeesService
): any => async (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const productId = +req.params.id as any;

    const product = await productService.getOneOnlineProduct({
      where: { id: productId },
      attributes: ['id', 'userId', 'status', 'price', 'stock', 'hasParameters', 'salesMethod']
    });

    if (!product) {
      throw TellsApiError.conflict(ProductErrorMessageEnum.PRODUCT_IS_UNAVAILABLE_FOR_PUBLISH);
    }

    if (product.hasParameters && product.parameterSets.length === 0) {
      throw ApiError.badRequest('Parameters set should not be empty');
    }

    if (product.price === undefined) {
      throw ApiError.badRequest('Parameter "price" should not be empty');
    }

    if (!product.categories.length) {
      throw ApiError.badRequest('Parameter "category" should not be empty');
    }

    if (!product.stories?.length) {
      throw ApiError.badRequest('Parameter "storyContent" should not be empty');
    }

    if (!product.images?.length) {
      throw ApiError.badRequest('Parameter "images" should not be empty');
    }

    if (!product.contents?.length) {
      throw ApiError.badRequest('Product content should not be empty');
    }

    if (!product.contents[0].title) {
      throw ApiError.badRequest('Parameter "title" should not be empty');
    }
    if (!product.contents[0].description) {
      throw ApiError.badRequest('Parameter "description" should not be empty');
    }

    const shippingFees = await productShippingFeesService.getAllByProductId(productId);

    if (shippingFees) {
      checkShippingRanges(shippingFees);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.product = product;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const onlineProductAccessByNameIdMiddleware = (productService: ProductService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.getOneOnlineProduct({
      where: { nameId: req.params.nameId }
    });

    if (!product) {
      throw ApiError.notFound();
    }

    if (product.status === ProductStatusEnum.PUBLISHED) {
      return next();
    }

    const isAuthor = req.user?.id && product.userId === req.user.id;
    if (isAuthor) {
      return next();
    }

    throw ApiError.notFound();
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const productEditingAccessMiddleware = (productService: ProductService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.getOnlineProductByNameId(req.params.nameId, 1, req.query.options?.language);

    if (!product || !req.user?.id || product.userId !== req.user.id) {
      throw ApiError.notFound();
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.product = product;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const productAccessByIdMiddleware = (productService: ProductService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.getOne({
      where: {
        id: req.params.id
      }
    });

    if (!product) {
      throw ApiError.notFound();
    }

    const isAuthor = req.user?.id && product.userId === req.user.id;
    if (isAuthor) {
      return next();
    }

    throw ApiError.notFound();
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const onlineProductCloneAvailableMiddleware = (productService: ProductService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = +req.params.id as any;

    const product = await productService.getOneOnlineProduct({
      where: { id: productId },
      attributes: ['id', 'userId', 'status']
    });

    if (!product) {
      throw TellsApiError.conflict(ProductErrorMessageEnum.PRODUCT_IS_UNAVAILABLE_FOR_CLONE);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.product = product;
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const instoreProductCloneAvailableMiddleware = (productService: ProductService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = +req.params.id as any;

    const product = await productService.getOneInstoreProduct({
      where: { id: productId },
      attributes: ['id', 'userId', 'status']
    });

    if (!product) {
      throw TellsApiError.conflict(ProductErrorMessageEnum.PRODUCT_IS_UNAVAILABLE_FOR_CLONE);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.product = product;
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const productUnpublishAvailableMiddleware = (productService: ProductService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = +req.params.id as any;

    const product = await productService.getOne({
      where: { id: productId },
      attributes: ['id', 'userId', 'status', 'salesMethod']
    });

    if (!product) {
      throw TellsApiError.conflict(ProductErrorMessageEnum.PRODUCT_IS_UNAVAILABLE_FOR_UNPUBLISH);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.product = product;
  } catch (err) {
    log.error(err);
    next(err);
  }

  next();
};

export const instoreProductPublishAvailableMiddleware = (
  productService: ProductService,
  productShippingFeesService: ProductShippingFeesService
): any => async (req: IExtendedRequest, res: Response, next: NextFunction) => {
  try {
    const productId = +req.params.id as any;

    const product = await productService.getOneInstoreProduct({
      where: { id: productId },
      attributes: [
        'id',
        'userId',
        'status',
        'price',
        'stock',
        'shipLaterStock',
        'hasParameters',
        'allowInternationalOrders',
        'overseasShippingFee',
        'salesMethod',
        'isShippingFeesEnabled',
        'isFreeShipment',
        'shippingFee'
      ]
    });

    if (!product) {
      throw TellsApiError.conflict(ProductErrorMessageEnum.PRODUCT_IS_UNAVAILABLE_FOR_PUBLISH);
    }

    const mainSchema = Joi.object({
      body: Joi.any().optional()
    }).required();

    const result = mainSchema.keys({ body: ValidatePublishInstoreProductSchema }).validate({ body: product });
    if (result?.error) {
      if (result.error.details?.length) {
        log.warn('Request data is invalid. Reason : ' + result.error.details[0]?.message);
        return next(new ValidationError(result.error.details[0]?.message));
      }
      log.warn('Request data is invalid. Reason :', result.error);
      return next(new ValidationError('Invalid input data'));
    }

    const shippingFees = await productShippingFeesService.getAllByProductId(productId);

    if (shippingFees) {
      checkShippingRanges(shippingFees);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.product = product;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const productAvailableMiddleware = (productService: ProductService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = +req.params.id as any;

    const product = await productService.getOne({
      where: { id: productId },
      attributes: ['id', 'userId', 'status', 'salesMethod']
    });

    if (!product) {
      throw TellsApiError.conflict(ProductErrorMessageEnum.PRODUCT_DOES_NOT_EXIST);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.product = product;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const instoreProductEditingAccessMiddleware = (productService: ProductService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await productService.getInstoreProductByNameId(req.params.nameId, 1, req.query.options?.language);

    if (!product || !req.user?.id || product.userId !== req.user.id) {
      throw ApiError.notFound();
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.product = product;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const instoreProductEditAvailableMiddleware = (productService: ProductService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = +req.params.id as any;

    const product = await productService.getOneInstoreProduct({
      where: { id: productId },
      attributes: ['id', 'nameId', 'userId', 'status', 'price', 'stock', 'hasParameters']
    });

    if (!product) {
      throw TellsApiError.conflict(ProductErrorMessageEnum.PRODUCT_IS_UNAVAILABLE_FOR_EDIT);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.product = product;

    if (product.status === ProductStatusEnum.DRAFT) {
      return next();
    }

    const mainSchema = Joi.object({
      body: Joi.any().optional()
    }).required();

    const result = mainSchema.keys({ body: InStoreProductRequiredFieldsBodySchema }).validate({ body: req.body });
    if (result?.error) {
      if (result.error.details?.length) {
        log.warn('Request data is invalid. Reason : ' + result.error.details[0]?.message);
        return next(new ValidationError(result.error.details[0]?.message));
      }
      log.warn('Request data is invalid. Reason :', result.error);
      return next(new ValidationError('Invalid input data'));
    }

    if (req.body.hasParameters && product.parameterSets.length === 0) {
      throw ApiError.badRequest('Parameter sets should not be empty');
    }

    const shippingFees = req.body.shippingFees as IProductShippingFeesModel[];

    if (shippingFees) {
      checkShippingRanges(shippingFees);
    }
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const instoreProductAccessByNameIdMiddleware = (productService: ProductService): any => async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw ApiError.notFound();
    }

    const product = await productService.getInstoreProductByNameId(req.params.nameId, 1, req.query.options?.language);

    if (!product || product.status !== ProductStatusEnum.PUBLISHED) {
      throw ApiError.notFound();
    }

    if (req.user.role !== UserRoleEnum.SHOP_MASTER && req.state?.shop.id !== product.shopId) {
      throw ApiError.notFound();
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.product = product;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

export const cloneInstoreFromOnlineProductsMiddleware = (productService: ProductService): any => async (
  req: IExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const productIds = req.body.ids as number[];

    const products = await productService.getOnlineProductForCloneInstore(productIds);

    if (products.length !== productIds.length) {
      throw TellsApiError.conflict(ProductErrorMessageEnum.PRODUCT_IS_UNAVAILABLE_FOR_CLONE);
    }

    if (!req.state) {
      req.state = {};
    }

    req.state.products = products;
  } catch (err) {
    log.error(err);
    next(err);
  }
  next();
};

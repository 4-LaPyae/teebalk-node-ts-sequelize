import { NextFunction, Request, Response } from 'express';

import {
  IProductColorModel,
  IProductCustomParameterModel,
  IProductImageModel,
  IProductMaterialModel,
  IProductPatternModel
} from '../../database';
import { sanitize, stripTags } from '../../helpers';

export const productSanitizeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const product = req.body;

  if (product.content) {
    if (product.content.title) {
      product.content.title = stripTags(product.content.title);
    }

    if (product.content.subTitle) {
      product.content.subTitle = stripTags(product.content.subTitle);
    }

    if (product.content.annotation) {
      product.content.annotation = stripTags(product.content.annotation);
    }
  }

  if (product.images) {
    product.images.map((item: IProductImageModel) => {
      if (item.imageDescription) {
        item.imageDescription = stripTags(item?.imageDescription);
      }
      item.imagePath = stripTags(item.imagePath);
    });
  }

  if (product.colors) {
    product.colors.map((item: IProductColorModel) => {
      item.color = stripTags(item.color);
    });
  }

  if (product.patterns) {
    product.patterns.map((item: IProductPatternModel) => {
      item.pattern = stripTags(item.pattern);
    });
  }

  if (product.customParameters) {
    product.customParameters.map((item: IProductCustomParameterModel) => {
      item.customParameter = stripTags(item.customParameter);
    });
  }

  if (product.materials) {
    product.materials.map((item: IProductMaterialModel) => {
      item.material = stripTags(item.material);
    });
  }

  if (product.story) {
    product.story.content = sanitize(product.story.content);
    product.story.plainTextContent = stripTags(product.story.plainTextContent);
    product.story.summaryContent = sanitize(product.story.summaryContent);
    product.story.plainTextSummaryContent = stripTags(product.story.summaryContent);
  }

  if (product.transparency) {
    if (product.transparency.recycledMaterialDescription) {
      product.transparency.recycledMaterialDescription = sanitize(product.transparency.recycledMaterialDescription);
      product.transparency.plainTextRecycledMaterialDescription = stripTags(product.transparency.recycledMaterialDescription);
    }
    if (product.transparency.sdgsReport) {
      product.transparency.sdgsReport = sanitize(product.transparency.sdgsReport);
      product.transparency.plainTextSdgsReport = stripTags(product.transparency.sdgsReport);
    }

    if (product.transparency.contributionDetails) {
      product.transparency.contributionDetails = sanitize(product.transparency.contributionDetails);
      product.transparency.plainTextContributionDetails = stripTags(product.transparency.contributionDetails);
    }

    if (product.transparency.effect) {
      product.transparency.effect = sanitize(product.transparency.effect);
      product.transparency.plainTextEffect = stripTags(product.transparency.effect);
    }

    if (product.transparency.culturalProperty) {
      product.transparency.culturalProperty = sanitize(product.transparency.culturalProperty);
      product.transparency.plainTextCulturalProperty = stripTags(product.transparency.culturalProperty);
    }

    if (product.transparency.rarenessDescription) {
      product.transparency.rarenessDescription = stripTags(product.transparency.rarenessDescription);
    }
  }
  next();
};

export const instoreProductSanitizeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const product = req.body;

  if (product.content) {
    if (product.content.title) {
      product.content.title = stripTags(product.content.title);
    }
  }

  if (product.images) {
    product.images.map((item: IProductImageModel) => {
      if (item.imageDescription) {
        item.imageDescription = stripTags(item?.imageDescription);
      }
      item.imagePath = stripTags(item.imagePath);
    });
  }

  if (product.colors) {
    product.colors.map((item: IProductColorModel) => {
      item.color = stripTags(item.color);
    });
  }

  if (product.customParameters) {
    product.customParameters.map((item: IProductCustomParameterModel) => {
      item.customParameter = stripTags(item.customParameter);
    });
  }

  next();
};

export const searchTextProductSanitizeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.query.searchText) {
    req.query.searchText = decodeURIComponent(req.query.searchText);
  }

  next();
};

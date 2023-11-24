import { NextFunction, Request, Response } from 'express';

import { sanitize, stripTags } from '../../helpers';

export const shopSanitizeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const shop = req.body;

  if (shop.description) {
    shop.description = sanitize(shop.description);
  }

  if (shop.title) {
    shop.title = stripTags(shop.title);
  }

  if (shop.subTitle) {
    shop.subTitle = stripTags(shop.subTitle);
  }

  if (shop.imageDescription) {
    shop.imageDescription = stripTags(shop.imageDescription);
  }

  next();
};

export const shopEmailSanitizeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const email = req.body;

  if (email.emailSubject) {
    email.emailSubject = stripTags(email.emailSubject);
  }

  if (email.emailBody) {
    email.emailBody = stripTags(email.emailBody);
  }

  next();
};

export const shopEmailTemplateSanitizeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const template = req.body;

  if (template.title) {
    template.title = stripTags(template.title);
  }

  if (template.emailSubject) {
    template.emailSubject = stripTags(template.emailSubject);
  }

  if (template.emailBody) {
    template.emailBody = stripTags(template.emailBody);
  }

  next();
};

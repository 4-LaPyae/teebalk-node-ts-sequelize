import { NextFunction, Request, Response } from 'express';

import { IExperienceImageModel, IExperienceMaterialModel } from '../../database';
import { sanitize, stripTags } from '../../helpers';

// eslint-disable-next-line complexity
export const experienceSanitizeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const experience = req.body;

  if (experience.title) {
    experience.title = stripTags(experience.title);
  }

  if (experience.description) {
    experience.description = sanitize(experience.description);
    experience.plainTextDescription = stripTags(experience.description);
  }

  if (experience.storySummary) {
    experience.storySummary = sanitize(experience.storySummary);
    experience.plainTextStorySummary = stripTags(experience.storySummary);
  }

  if (experience.story) {
    experience.story = sanitize(experience.story);
    experience.plainTextStory = stripTags(experience.story);
  }

  if (experience.requiredItems) {
    experience.requiredItems = sanitize(experience.requiredItems);
    experience.plainTextRequiredItems = stripTags(experience.requiredItems);
  }

  if (experience.warningItems) {
    experience.warningItems = sanitize(experience.warningItems);
    experience.plainTextWarningItems = stripTags(experience.warningItems);
  }

  if (experience.cancelPolicy) {
    experience.cancelPolicy = sanitize(experience.cancelPolicy);
    experience.plainTextCancelPolicy = stripTags(experience.cancelPolicy);
  }

  if (experience.location) {
    experience.location = sanitize(experience.location);
  }

  if (experience.locationDescription) {
    experience.locationDescription = sanitize(experience.locationDescription);
    experience.plainTextLocationDescription = stripTags(experience.locationDescription);
  }

  if (experience.images) {
    experience.images.map((item: IExperienceImageModel) => {
      if (item.imageDescription) {
        item.imageDescription = stripTags(item.imageDescription);
      }
      item.imagePath = stripTags(item.imagePath);
    });
  }

  if (experience.tickets) {
    for (const ticket of experience.tickets) {
      ticket.title = stripTags(ticket.title);
    }
  }

  if (experience.transparency) {
    if (experience.transparency.materials) {
      experience.transparency.materials.map((item: IExperienceMaterialModel) => {
        item.material = stripTags(item.material);
      });
    }
    if (experience.transparency.recycledMaterialDescription) {
      experience.transparency.recycledMaterialDescription = sanitize(experience.transparency.recycledMaterialDescription);
      experience.transparency.plainTextRecycledMaterialDescription = stripTags(experience.transparency.recycledMaterialDescription);
    }
    if (experience.transparency.sdgsReport) {
      experience.transparency.sdgsReport = sanitize(experience.transparency.sdgsReport);
      experience.transparency.plainTextSdgsReport = stripTags(experience.transparency.sdgsReport);
    }

    if (experience.transparency.contributionDetails) {
      experience.transparency.contributionDetails = sanitize(experience.transparency.contributionDetails);
      experience.transparency.plainTextContributionDetails = stripTags(experience.transparency.contributionDetails);
    }

    if (experience.transparency.effect) {
      experience.transparency.effect = sanitize(experience.transparency.effect);
      experience.transparency.plainTextEffect = stripTags(experience.transparency.effect);
    }

    if (experience.transparency.culturalProperty) {
      experience.transparency.culturalProperty = sanitize(experience.transparency.culturalProperty);
      experience.transparency.plainTextCulturalProperty = stripTags(experience.transparency.culturalProperty);
    }

    if (experience.transparency.rarenessDescription) {
      experience.transparency.rarenessDescription = stripTags(experience.transparency.rarenessDescription);
    }

    if (experience.answers) {
      experience.answers = Object.keys(experience.answers).reduce(
        (acc, key) => ({ ...acc, [key]: sanitize(stripTags((experience.answers as any)[key])) }),
        {}
      );
    }
  }

  next();
};

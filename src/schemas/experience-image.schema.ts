import * as Joi from 'joi';
export const ExperienceImageSchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(0),
  experienceId: Joi.number()
    .integer()
    .min(0),
  imagePath: Joi.string()
    .trim()
    .min(0)
    .max(300)
    .required(),
  imageDescription: Joi.string()
    .max(300)
    .allow([null, '']),
  position: Joi.number()
    .integer()
    .min(0)
    .allow(null)
});

export const ArrayExperienceImageSchema = Joi.array()
  .items(ExperienceImageSchema)
  .unique('position')
  .allow([null, []]);

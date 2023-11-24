import * as Joi from 'joi';
import _ from 'lodash';

import { ALLOW_ALPHANUMERIC_AND_NUM_REGEX, ALLOW_ALPHANUMERIC_AND_UNDERSCORE_WITHOUT_NUM_ONLY_REGEX } from '../constants';
import { ExperienceStatusEnum } from '../database';

import { ArrayExperienceImageSchema } from './experience-image.schema';
import { ArrayExperienceSessionSchema, ExperienceSessionSchema, ExperienceSessionTicketSchema } from './experience-session.schema';
import { ArrayExperienceTicketSchema, ExperienceTicketSchema } from './experience-ticket.schema';
import { LanguageSchema } from './request.schema';

export const ExperienceNameIdSchema = Joi.string()
  .trim()
  .regex(ALLOW_ALPHANUMERIC_AND_UNDERSCORE_WITHOUT_NUM_ONLY_REGEX)
  .min(1)
  .max(30);

export const TicketCodeSchema = Joi.string()
  .trim()
  .regex(ALLOW_ALPHANUMERIC_AND_NUM_REGEX)
  .min(1)
  .max(8);

export const SessionIdSchema = Joi.number()
  .integer()
  .min(1)
  .required();

export const ExperienceStatusSchema = Joi.string()
  .valid(Object.values(ExperienceStatusEnum))
  .label('status');

export enum TopExperienceTypeEnum {
  TOP_EXPERIENCE = 'experiences'
}

export const ExperienceMaterialSchema = Joi.object({
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
  isOrigin: Joi.boolean(),
  language: LanguageSchema
});

export const ExperienceTransparencySchema = Joi.object({
  id: Joi.number().optional(),
  sdgs: Joi.array().items(
    Joi.number()
      .integer()
      .min(1)
  ),
  ethicalLevel: Joi.number()
    .integer()
    .allow([null, '']),
  recycledMaterialPercent: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .allow([null, '']),
  materials: Joi.array()
    .items(ExperienceMaterialSchema)
    .unique((a, b) => a.displayPosition === b.displayPosition),
  materialNaturePercent: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .allow([null, '']),
  recycledMaterialDescription: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextRecycledMaterialDescription: Joi.string()
    .trim()
    .allow([null, '']),
  sdgsReport: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextSdgsReport: Joi.string()
    .trim()
    .allow([null, '']),
  contributionDetails: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextContributionDetails: Joi.string()
    .trim()
    .allow([null, '']),
  effect: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextEffect: Joi.string()
    .trim()
    .allow([null, '']),
  culturalProperty: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextCulturalProperty: Joi.string()
    .trim()
    .allow([null, '']),
  rarenessLevel: Joi.number()
    .integer()
    .min(1)
    .allow([null, '']),
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

export const ExperienceOrganizerSchema = Joi.object({
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
  isOrigin: Joi.boolean()
});

export const ArrayExperienceOrganizersSchema = Joi.array()
  .items(ExperienceOrganizerSchema)
  .unique((a, b) => a.displayPosition === b.displayPosition);

export const NewExperienceBodySchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(300)
    .allow([null, '']),
  description: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextDescription: Joi.string()
    .trim()
    .allow([null, '']),
  storySummary: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextStorySummary: Joi.string()
    .trim()
    .allow([null, '']),
  story: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextStory: Joi.string()
    .trim()
    .allow([null, '']),
  requiredItems: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextRequiredItems: Joi.string()
    .trim()
    .allow([null, '']),
  warningItems: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextWarningItems: Joi.string()
    .trim()
    .allow([null, '']),
  cancelPolicy: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextCancelPolicy: Joi.string()
    .trim()
    .allow([null, '']),
  tickets: ArrayExperienceTicketSchema,
  transparency: ExperienceTransparencySchema,
  sessions: ArrayExperienceSessionSchema,
  categoryId: Joi.number()
    .integer()
    .min(1)
    .allow([null, '']),
  organizers: ArrayExperienceOrganizersSchema,
  images: ArrayExperienceImageSchema,
  locationCoordinate: Joi.object().allow(null),
  location: Joi.string()
    .max(300)
    .allow('', null),
  locationPlaceId: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  country: Joi.string().allow('', null),
  locationDescription: Joi.string()
    .trim()
    .allow('', null),
  plainTextLocationDescription: Joi.string().allow('', null),
  reflectionChangeTimezone: Joi.bool().allow(null)
})
  .required()
  .label('body');

export const UpdateExperienceBodySchema = Joi.object({
  id: Joi.number()
    .integer()
    .min(1),
  shopId: Joi.number()
    .integer()
    .min(1),
  title: Joi.string()
    .trim()
    .max(300)
    .allow([null, '']),
  description: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextDescription: Joi.string()
    .trim()
    .allow([null, '']),
  storySummary: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextStorySummary: Joi.string()
    .trim()
    .allow([null, '']),
  story: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextStory: Joi.string()
    .trim()
    .allow([null, '']),
  requiredItems: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextRequiredItems: Joi.string()
    .trim()
    .allow([null, '']),
  warningItems: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextWarningItems: Joi.string()
    .trim()
    .allow([null, '']),
  cancelPolicy: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextCancelPolicy: Joi.string()
    .trim()
    .allow([null, '']),
  tickets: ArrayExperienceTicketSchema,
  transparency: ExperienceTransparencySchema,
  sessions: ArrayExperienceSessionSchema,
  categoryId: Joi.number()
    .integer()
    .min(1)
    .allow([null, '']),
  organizers: ArrayExperienceOrganizersSchema,
  images: ArrayExperienceImageSchema,
  language: LanguageSchema,
  locationCoordinate: Joi.object().allow(null),
  location: Joi.string()
    .max(300)
    .allow('', null),
  locationPlaceId: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  country: Joi.string().allow('', null),
  locationDescription: Joi.string()
    .trim()
    .allow('', null),
  plainTextLocationDescription: Joi.string().allow('', null),
  reflectionChangeTimezone: Joi.bool().allow(null)
})
  .required()
  .label('body');

export const getExperienceIdParameterSchema = (keyNames: string[] = ['nameId']) =>
  Joi.object(
    keyNames.reduce((acc: any, keyName: string) => {
      acc[keyName] = ExperienceNameIdSchema;
      return acc;
    }, {})
  )
    .required()
    .label('parameters');

export const ExperienceNameIdParameterSchema = getExperienceIdParameterSchema();

export const getExperienceOnlineEventLinkSchema = (keyNames: string[] = ['sessionId', 'ticketCode']) =>
  Joi.object(
    keyNames.reduce((acc: any) => {
      acc.sessionId = SessionIdSchema;
      acc.ticketCode = TicketCodeSchema;
      return acc;
    }, {})
  )
    .required()
    .label('parameters');

export const ExperienceOnlineEventLinkSchema = getExperienceOnlineEventLinkSchema();

export const getExperienceEventDetailsSchema = (keyNames: string[] = ['sessionId']) =>
  Joi.object(
    keyNames.reduce((acc: any) => {
      acc.sessionId = SessionIdSchema;
      return acc;
    }, {})
  )
    .required()
    .label('parameters');

export const ExperienceEventDetailsSchema = getExperienceEventDetailsSchema();

export const getExperienceSessionTicketCodeParameterSchema = (keyNames: string[] = ['ticketCode']) =>
  Joi.object(
    keyNames.reduce((acc: any, keyName: string) => {
      acc[keyName] = TicketCodeSchema;
      return acc;
    }, {})
  )
    .required()
    .label('parameters');

export const ExperienceSessionTicketCodeParameterSchema = getExperienceSessionTicketCodeParameterSchema();

export const ArrayExperienceImagesRequiredFieldsSchema = Joi.array()
  .min(1)
  .items(
    Joi.object({
      id: Joi.number()
        .integer()
        .min(0),
      imagePath: Joi.string()
        .trim()
        .min(0)
        .max(300)
        .required(),
      imageDescription: Joi.string()
        .trim()
        .max(300)
        .allow([null, '']),
      position: Joi.number()
        .integer()
        .min(0)
        .allow(null),
      isOrigin: Joi.boolean()
    })
  );

export const ArrayExperienceOrganizersRequiredFieldsSchema = Joi.array()
  .min(1)
  .items(
    Joi.object({
      id: Joi.number()
        .integer()
        .min(0),
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
        .required(),
      photo: Joi.string()
        .trim()
        .max(1000)
        .allow([null, '']),
      displayPosition: Joi.number()
        .integer()
        .min(0),
      isOrigin: Joi.boolean()
    })
  );

export const ExperienceTransparencyRequiredFieldsSchema = Joi.object({
  id: Joi.number().optional(),
  sdgs: Joi.array().items(
    Joi.number()
      .integer()
      .min(1)
  ),
  ethicalLevel: Joi.number()
    .integer()
    .allow([null, '']),
  recycledMaterialPercent: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .allow([null, '']),
  materials: Joi.array()
    .items(ExperienceMaterialSchema)
    .unique((a, b) => a.displayPosition === b.displayPosition),
  materialNaturePercent: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .allow([null, '']),
  recycledMaterialDescription: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextRecycledMaterialDescription: Joi.string()
    .trim()
    .max(1000)
    .error(() => ({ message: '"recycledMaterialDescription" length must be less than or equal to 1000 characters long' } as any))
    .allow([null, '']),
  sdgsReport: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextSdgsReport: Joi.string()
    .trim()
    .max(1000)
    .error(() => ({ message: '"sdgsReport" length must be less than or equal to 1000 characters long' } as any))
    .allow([null, '']),
  contributionDetails: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextContributionDetails: Joi.string()
    .trim()
    .max(1000)
    .error(() => ({ message: '"contributionDetails" length must be less than or equal to 1000 characters long' } as any))
    .allow([null, '']),
  effect: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextEffect: Joi.string()
    .trim()
    .max(1000)
    .error(() => ({ message: '"effect" length must be less than or equal to 1000 characters long' } as any))
    .allow([null, '']),
  culturalProperty: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextCulturalProperty: Joi.string()
    .trim()
    .max(1000)
    .error(() => ({ message: '"culturalProperty" length must be less than or equal to 1000 characters long' } as any))
    .allow([null, '']),
  rarenessLevel: Joi.number()
    .integer()
    .min(1)
    .allow([null, '']),
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

export const ExperienceRequiredFieldsBodySchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(300)
    .required(),
  description: Joi.string()
    .trim()
    .required(),
  plainTextDescription: Joi.string()
    .trim()
    .max(5000)
    .error(() => ({ message: '"description" length must be less than or equal to 5000 characters long' } as any))
    .allow([null, '']),
  storySummary: Joi.string()
    .trim()
    .required(),
  plainTextStorySummary: Joi.string()
    .trim()
    .max(1000)
    .error(() => ({ message: '"storySummary" length must be less than or equal to 1000 characters long' } as any))
    .allow([null, '']),
  story: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextStory: Joi.string()
    .trim()
    .max(10000)
    .error(() => ({ message: '"story" length must be less than or equal to 10000 characters long' } as any))
    .allow([null, '']),
  requiredItems: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextRequiredItems: Joi.string()
    .trim()
    .max(1000)
    .error(() => ({ message: '"requiredItems" length must be less than or equal to 1000 characters long' } as any))
    .allow([null, '']),
  warningItems: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextWarningItems: Joi.string()
    .trim()
    .max(1000)
    .error(() => ({ message: '"warningItems" length must be less than or equal to 1000 characters long' } as any))
    .allow([null, '']),
  cancelPolicy: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextCancelPolicy: Joi.string()
    .trim()
    .max(1000)
    .error(() => ({ message: '"cancelPolicy" length must be less than or equal to 1000 characters long' } as any))
    .allow([null, '']),
  categoryId: Joi.number()
    .integer()
    .min(1)
    .required(),
  images: ArrayExperienceImagesRequiredFieldsSchema.required(),
  organizers: ArrayExperienceOrganizersRequiredFieldsSchema.required(),
  tickets: Joi.array()
    .items(ExperienceTicketSchema)
    .unique('title')
    .min(1)
    .required(),
  transparency: ExperienceTransparencyRequiredFieldsSchema,
  sessions: Joi.array()
    .items(ExperienceSessionSchema)
    .min(1)
    .required(),
  language: LanguageSchema,
  locationCoordinate: Joi.object().allow(null),
  location: Joi.string()
    .max(300)
    .allow('', null),
  locationPlaceId: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  country: Joi.string().allow('', null),
  locationDescription: Joi.string()
    .trim()
    .allow('', null),
  plainTextLocationDescription: Joi.string()
    .max(500)
    .error(() => ({ message: '"location description" length must be less than or equal to 500 characters long' } as any))
    .allow('', null),
  reflectionChangeTimezone: Joi.bool().allow(null)
})
  .required()
  .label('body');

export const ValidatePublishExperienceSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(300)
    .required(),
  description: Joi.string()
    .trim()
    .required(),
  plainTextDescription: Joi.string()
    .trim()
    .max(5000)
    .error(() => ({ message: '"description" length must be less than or equal to 5000 characters long' } as any))
    .allow([null, '']),
  storySummary: Joi.string()
    .trim()
    .required(),
  plainTextStorySummary: Joi.string()
    .trim()
    .max(1000)
    .error(() => ({ message: '"storySummary" length must be less than or equal to 1000 characters long' } as any))
    .allow([null, '']),
  story: Joi.string()
    .trim()
    .allow([null, '']),
  plainTextStory: Joi.string()
    .trim()
    .max(10000)
    .error(() => ({ message: '"story" length must be less than or equal to 10000 characters long' } as any))
    .allow([null, '']),
  plainTextRequiredItems: Joi.string()
    .trim()
    .max(1000)
    .error(() => ({ message: '"requiredItems" length must be less than or equal to 1000 characters long' } as any))
    .allow([null, '']),
  plainTextWarningItems: Joi.string()
    .trim()
    .max(1000)
    .error(() => ({ message: '"warningItems" length must be less than or equal to 1000 characters long' } as any))
    .allow([null, '']),
  plainTextCancelPolicy: Joi.string()
    .trim()
    .max(1000)
    .error(() => ({ message: '"cancelPolicy" length must be less than or equal to 1000 characters long' } as any))
    .allow([null, '']),
  categoryId: Joi.number()
    .integer()
    .min(1)
    .required(),
  images: ArrayExperienceImagesRequiredFieldsSchema.required(),
  organizers: ArrayExperienceOrganizersRequiredFieldsSchema.required(),
  tickets: Joi.array()
    .items(ExperienceTicketSchema.unknown(true))
    .unique('title')
    .min(1)
    .required(),
  transparency: ExperienceTransparencyRequiredFieldsSchema.unknown(true),
  sessions: Joi.array()
    .items(
      Joi.object({
        id: Joi.number()
          .integer()
          .min(0),
        startTime: Joi.date()
          .iso()
          .required(),
        endTime: Joi.date()
          .iso()
          .required(),
        defaultTimezone: Joi.string()
          .max(300)
          .required(),
        tickets: Joi.array()
          .items(ExperienceSessionTicketSchema.unknown(true))
          .unique('title')
          .allow([null, []])
      }).unknown(true)
    )
    .min(1)
    .required(),
  language: LanguageSchema,
  location: Joi.string()
    .max(300)
    .allow('', null),
  plainTextLocationDescription: Joi.string()
    .max(500)
    .error(() => ({ message: '"location description" length must be less than or equal to 500 characters long' } as any))
    .allow('', null)
})
  .required()
  .unknown(true)
  .label('body');

export const AssignLinkBodySchema = Joi.object({
  reservationLinkNameIds: Joi.array()
    .min(1)
    .max(1)
    .items(
      Joi.string()
        .required()
        .trim()
        .regex(ALLOW_ALPHANUMERIC_AND_NUM_REGEX)
        .min(1)
        .max(30)
    )
});

export const CheckinBodySchema = Joi.object({
  sessionId: SessionIdSchema,
  ticketCode: Joi.array()
    .min(1)
    .items(TicketCodeSchema),
  answer: Joi.object()
    .allow(null, {})
    .optional()
})
  .required()
  .unknown(true)
  .label('body');

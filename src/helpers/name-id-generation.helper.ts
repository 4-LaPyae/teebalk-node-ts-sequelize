import { randomBytes } from 'crypto';

export const generateNameId = (length = 30): string =>
  randomBytes(length + 2)
    .toString('base64')
    .replace(/\W/g, '')
    .substring(0, length);

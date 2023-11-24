import { LanguageEnum } from '../constants';

const titlePrefix = {
  [LanguageEnum.ENGLISH]: '(COPY) ',
  [LanguageEnum.JAPANESE]: '(COPY) '
};

export const cloneProductTitle = (title: string, language: LanguageEnum = LanguageEnum.ENGLISH): string => {
  const prefix = titlePrefix[language];

  const maxLength = 300;
  const cloneTitle = prefix + title;

  if (cloneTitle.length > maxLength) {
    return cloneTitle.substring(0, maxLength);
  }

  return cloneTitle;
};

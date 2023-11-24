import { LanguageEnum } from '../constants';

export const selectWithLanguage = (items: any[] = [], language?: LanguageEnum, getArray = false) => {
  if (!getArray) {
    return (language ? items.find(item => item.language === language) : items.find(item => item.isOrigin)) || items[0] || {};
  }
  if (language) {
    const filteredItems = items.filter(item => item.language === language);
    if (filteredItems.length) {
      return filteredItems;
    }
  }
  return items.filter(item => item.isOrigin) || [];
};

export const convertToMultiLanguageObject = (obj: any, key: string) => {
  const keys = {} as any;
  for (const content of obj.contents || []) {
    keys[content.language as keyof Record<string, any>] = content[key];
  }
  obj[key as keyof Record<string, any>] = keys;
};

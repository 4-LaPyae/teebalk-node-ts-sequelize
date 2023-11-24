import striptags from 'striptags';

export const stripTags = (html: string, allowedTags = []): string => {
  const parsed = striptags(html, allowedTags, ' ');

  return parsed.replace(/ +/g, ' ').trim();
};

export const striptTagsAndTrim = (html: string, len = 500): string => {
  return stripTags(html).substr(0, len) + '...';
};

import { LanguageEnum } from '../constants';
import { DURATION_TRANSLATIONS, EMAIL_DATE_FORMATS, TIME_DURATION_TRANSLATIONS } from '../services/experience';

const moment = require('moment-timezone');

export const isSameDate = (startTime: string, endTime: string): boolean => {
  return moment(startTime).format(EMAIL_DATE_FORMATS.DATE_FORMAT_EN) === moment(endTime).format(EMAIL_DATE_FORMATS.DATE_FORMAT_EN);
};

export const getDateString = (date: string, language: LanguageEnum): string => {
  const formatDate = language === LanguageEnum.JAPANESE ? EMAIL_DATE_FORMATS.BIRTHDAY_FORMAT_JA : EMAIL_DATE_FORMATS.BIRTHDAY_FORMAT_EN;
  return moment(date)
    .locale(language)
    .format(formatDate);
};

export const getLocaleDateTimeString = (dateTime: string, formatDateTime: string, timeZone: string, language: LanguageEnum): string => {
  return moment(dateTime)
    .locale(language)
    .tz(timeZone)
    .format(formatDateTime);
};
export const getLocaleDateTimeFormatEmailString = (startTime: string, endTime: string, timeZone: string, language: LanguageEnum) => {
  const formatDateTime =
    language === LanguageEnum.JAPANESE ? EMAIL_DATE_FORMATS.DATE_TIME_FORMAT_JA : EMAIL_DATE_FORMATS.DATE_TIME_FORMAT_EN;
  const formatDate = language === LanguageEnum.JAPANESE ? EMAIL_DATE_FORMATS.DATE_FORMAT_JA : EMAIL_DATE_FORMATS.DATE_FORMAT_EN;

  let momentStartTime = getLocaleDateTimeString(startTime, formatDateTime, timeZone, language);
  const momentEndTime = getLocaleDateTimeString(endTime, formatDateTime, timeZone, language);

  if (isSameDate(startTime, endTime) === true) {
    momentStartTime = getLocaleDateTimeString(startTime, formatDate, timeZone, language);
    return {
      startTimeLatest: momentStartTime,
      endTimeLatest: undefined
    };
  }
  return {
    startTimeLatest: momentStartTime,
    endTimeLatest: momentEndTime
  };
};

export const getTimeDurationString = (startTime: string, endTime: string, timeZone: string, language: LanguageEnum): string => {
  const duration = moment.duration(moment(endTime).diff(moment(startTime)));
  let minutes = Math.ceil(duration.asMilliseconds() / (1000 * 60));
  let hours = 0;
  let days = 0;
  if (minutes >= 60) {
    hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
  }
  if (minutes || hours > 24) {
    days = Math.floor(hours / 24);
    hours = hours % 24;
  }
  const space = language === LanguageEnum.JAPANESE ? '' : ' ';
  const formatTime = language === LanguageEnum.JAPANESE ? EMAIL_DATE_FORMATS.HOUR_FORMAT_JA : EMAIL_DATE_FORMATS.HOUR_FORMAT_EN;
  const durationTextFirst = DURATION_TRANSLATIONS[language];
  const dateTime = TIME_DURATION_TRANSLATIONS[language];
  const translatedDayText = days === 1 ? dateTime.Day : dateTime.Days;
  const translatedHourText = hours === 1 ? dateTime.Hour : dateTime.Hours;
  const translatedMinuteText = minutes === 1 ? dateTime.Minute : dateTime.Minutes;

  let durationText = '';
  if (days) {
    durationText = `${days}${space}${translatedDayText}`;
  }
  if (hours) {
    durationText = `${durationText}${space}${hours}${space}${translatedHourText}`;
  }
  if (minutes) {
    durationText = `${durationText}${space}${minutes}${space}${translatedMinuteText}`;
  }

  if (isSameDate(startTime, endTime) === true) {
    const timeStart = moment(startTime)
      .locale(language)
      .tz(timeZone)
      .format(formatTime);
    const timeEnd = moment(endTime)
      .locale(language)
      .tz(timeZone)
      .format(formatTime);
    return `${timeStart} - ${timeEnd} (${durationTextFirst.duration} ${durationText})`;
  }

  return `${durationTextFirst.duration} ${durationText}`;
};

export const getDefaultTimeString = (startTime: string, endTime: string, timeZone: string, language: LanguageEnum): string => {
  const formatTime = language === LanguageEnum.JAPANESE ? EMAIL_DATE_FORMATS.HOUR_FORMAT_JA : EMAIL_DATE_FORMATS.HOUR_FORMAT_EN;
  if (isSameDate(startTime, endTime) === true) {
    const timeStart = moment(startTime)
      .locale(language)
      .tz(timeZone)
      .format(formatTime);

    const timeEnd = moment(endTime)
      .locale(language)
      .tz(timeZone)
      .format(formatTime);

    return `${timeStart} - ${timeEnd}`;
  }

  return '';
};

export const getFormatTimeZone = (timeZone: string): string => {
  return `(${moment()
    .tz(timeZone)
    .toLocaleString()
    .slice(-8)}) ${timeZone}`;
};

export const stringDateFormatter = (stringDate: string): string => {
  const date = new Date(stringDate);

  const year_str = '' + date.getFullYear();

  let month_str = '' + (1 + date.getMonth());
  let day_str = '' + date.getDate();
  let hour_str = '' + date.getHours();
  let minute_str = '' + date.getMinutes();

  month_str = ('0' + month_str).slice(-2);
  day_str = ('0' + day_str).slice(-2);
  hour_str = ('0' + hour_str).slice(-2);
  minute_str = ('0' + minute_str).slice(-2);

  let format_str = 'YYYY/MM/DD hh:mm';
  format_str = format_str.replace(/YYYY/g, year_str);
  format_str = format_str.replace(/MM/g, month_str);
  format_str = format_str.replace(/DD/g, day_str);
  format_str = format_str.replace(/hh/g, hour_str);
  format_str = format_str.replace(/mm/g, minute_str);

  return format_str;
};

export const getAgeFromDateOfBirth = (dateOfBirth?: string): number | undefined => {
  if (!dateOfBirth) {
    return undefined;
  }
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  const date = today.getDate() - birthDate.getDate();
  if (month < 0 || (month === 0 && date < 0)) {
    age--;
  }
  return age;
};

export const getUTCDateWithoutTime = (date = new Date()) => {
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

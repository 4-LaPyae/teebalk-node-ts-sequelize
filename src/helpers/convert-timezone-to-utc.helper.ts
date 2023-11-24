import * as moment from 'moment-timezone';

export const convertTimezoneToUTC = (time: string, dateFormat: string, timezone: string): string => {
  return moment
    .tz(time, dateFormat, timezone)
    .utc()
    .format(dateFormat);
};

export interface IExchangeRateAPIResult {
  result: string;
  'error-type': string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: Date;
  time_next_update_unix: number;
  time_next_update_utc: Date;
  base_code: string;
  conversion_rates: { [Key: string]: number };
}

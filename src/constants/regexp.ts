// export const ALLOW_ALPHANUMERIC_AND_SPACE_REGEX = /^[a-zA-Z0-9 ]*$/;
// eslint-disable-next-line @typescript-eslint/tslint/config
export const ALLOW_ALPHANUMERIC_AND_SPACE_REGEX = /[一-龠ぁ-ゔァ-ヴーa-zA-Z0-9ａ-ｚＡ-Ｚ０-９々〆〤]+/u;

// eslint-disable-next-line @typescript-eslint/tslint/config
export const ALLOW_NUMERIC_DIGIT_ONLY_REGEX = /^\d+$/;

// eslint-disable-next-line @typescript-eslint/tslint/config
export const ALLOW_ALPHANUMERIC_WITHOUT_NUM_ONLY_REGEX = /(?!\d+$)(^[a-zA-Z\d]+$)/;

// eslint-disable-next-line @typescript-eslint/tslint/config
export const ALLOW_ALPHANUMERIC_AND_UNDERSCORE_WITHOUT_NUM_ONLY_REGEX = /(?!\d+$)(^\w+$)/;

// eslint-disable-next-line @typescript-eslint/tslint/config
export const ALLOW_ALPHANUMERIC_AND_NUM_REGEX = /^[a-zA-Z0-9_.-]*$/;

// eslint-disable-next-line @typescript-eslint/tslint/config
export const INTEGERS_JOINED_BY_COMMA_REGEX = /^([0-9]+,)*[0-9]+$/; // TODO resolve lint complaint

// eslint-disable-next-line @typescript-eslint/tslint/config,no-useless-escape
export const URL_HOST_REGEX = /^((http[s]?):\/)?\/?([^:\/\s]+)\//;

// eslint-disable-next-line @typescript-eslint/tslint/config,no-useless-escape
export const ALLOW_BASE64_IMAGE_DECODED_ONLY_REGEX = /^data:image\/(?:png|jpeg)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/;

// eslint-disable-next-line @typescript-eslint/tslint/config,no-useless-escape
export const EMAIL_PATTERN_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// eslint-disable-next-line @typescript-eslint/tslint/config,no-useless-escape
export const URL_REGEX = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;

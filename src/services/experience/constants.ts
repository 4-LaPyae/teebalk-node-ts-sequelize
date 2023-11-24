import { LanguageEnum } from '../../constants';
import { EthicalityLevelFieldEnum, ExperienceEventTypeEnum, HighlightTypeEnum, UserGenderEnum } from '../../database';

export interface IExperienceTransparencyFields {
  experienceTransparencyField: string;
  transparencyField: string | EthicalityLevelFieldEnum;
  type: string | HighlightTypeEnum;
}

export const EXPERIENCE_TRANSPARENCY_FIELDS: IExperienceTransparencyFields[] = [
  {
    experienceTransparencyField: 'materials',
    transparencyField: EthicalityLevelFieldEnum.MATERIAL,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },
  {
    experienceTransparencyField: 'materialNaturePercent',
    transparencyField: EthicalityLevelFieldEnum.MATERIAL,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },
  {
    experienceTransparencyField: 'sdgs',
    transparencyField: EthicalityLevelFieldEnum.SDGS,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },
  {
    experienceTransparencyField: 'sdgsReport',
    transparencyField: EthicalityLevelFieldEnum.SDGS,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },
  {
    experienceTransparencyField: 'contributionDetails',
    transparencyField: EthicalityLevelFieldEnum.CONTRIBUTION_DETAIL,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },

  {
    experienceTransparencyField: 'recycledMaterialPercent',
    transparencyField: EthicalityLevelFieldEnum.USE_OF_RECYCLED_MATERIALS,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },
  {
    experienceTransparencyField: 'recycledMaterialDescription',
    transparencyField: EthicalityLevelFieldEnum.USE_OF_RECYCLED_MATERIALS,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },
  {
    experienceTransparencyField: 'highlightPoints',
    transparencyField: 'Points you want to highlight',
    type: ''
  },
  {
    experienceTransparencyField: 'effect',
    transparencyField: 'Effect',
    type: ''
  },
  {
    experienceTransparencyField: 'culturalProperty',
    transparencyField: 'Cultural Property',
    type: ''
  },
  {
    experienceTransparencyField: 'rarenessLevel',
    transparencyField: 'Rareness',
    type: ''
  },
  {
    experienceTransparencyField: 'rarenessDescription',
    transparencyField: 'Rareness',
    type: ''
  }
];

export const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.sssZ';

export const DATE_TIME_DOWNLOAD_FORMAT = 'YYYY/MM/DD hh:mm A';

export const EMAIL_DATE_FORMATS = {
  DATE_TIME_FORMAT_EN: 'MMM DD, YYYY (ddd) hh:mm A',
  DATE_TIME_FORMAT_JA: 'YYYY年MMMDD日 (ddd) Ahh:mm',
  DATE_FORMAT_JA: 'YYYY年MMMDD日 (ddd)',
  DATE_FORMAT_EN: 'MMM DD, YYYY (ddd)',
  HOUR_FORMAT_JA: 'Ahh:mm',
  HOUR_FORMAT_EN: 'hh:mm A',
  BIRTHDAY_FORMAT_JA: 'YYYY年MMMDD日',
  BIRTHDAY_FORMAT_EN: 'YYYY/MM/DD'
};

export const TIME_DURATION_TRANSLATIONS = {
  [LanguageEnum.JAPANESE]: {
    Day: '日',
    Days: '日',
    Hour: '時間',
    Hours: '時間',
    Minute: '分',
    Minutes: '分'
  },
  [LanguageEnum.ENGLISH]: {
    Day: 'day',
    Days: 'days',
    Hour: 'hour',
    Hours: 'hours',
    Minute: 'minute',
    Minutes: 'minutes'
  }
};

export const EVENT_TYPE_TRANSLATIONS = {
  [LanguageEnum.JAPANESE]: {
    [ExperienceEventTypeEnum.ONLINE]: 'オンライン',
    [ExperienceEventTypeEnum.ONLINE_OFFLINE]: 'オンライン／オフライン',
    [ExperienceEventTypeEnum.OFFLINE]: 'オフライン'
  },
  [LanguageEnum.ENGLISH]: {
    [ExperienceEventTypeEnum.ONLINE]: 'Online',
    [ExperienceEventTypeEnum.ONLINE_OFFLINE]: 'Online/Offline',
    [ExperienceEventTypeEnum.OFFLINE]: 'Offline'
  }
};

export const DURATION_TRANSLATIONS = {
  [LanguageEnum.JAPANESE]: {
    duration: '開催期間'
  },
  [LanguageEnum.ENGLISH]: {
    duration: 'Duration'
  }
};

export const EXPERIENCE_DOWNLOAD_TRANSLATIONS = {
  [LanguageEnum.JAPANESE]: {
    Yes: 'O',
    No: 'X',
    New: '新規'
  },
  [LanguageEnum.ENGLISH]: {
    Yes: 'Yes',
    No: 'No',
    New: 'New'
  }
};

export const GENDER_TRANSLATIONS = {
  [LanguageEnum.JAPANESE]: {
    [UserGenderEnum.MALE]: '男',
    [UserGenderEnum.FEMALE]: '女',
    [UserGenderEnum.OTHER]: 'その他'
  },
  [LanguageEnum.ENGLISH]: {
    [UserGenderEnum.MALE]: 'Male',
    [UserGenderEnum.FEMALE]: 'Female',
    [UserGenderEnum.OTHER]: 'Other'
  }
};

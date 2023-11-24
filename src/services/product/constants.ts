import { EthicalityLevelFieldEnum, HighlightTypeEnum } from '../../database';

export interface IProductTransparencyFields {
  productTransparencyField: string;
  transparencyField: string | EthicalityLevelFieldEnum;
  type: string | HighlightTypeEnum;
}

export const PRODUCT_TRANSPARENCY_FIELDS: IProductTransparencyFields[] = [
  {
    productTransparencyField: 'producers',
    transparencyField: EthicalityLevelFieldEnum.PRODUCER,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },
  {
    productTransparencyField: 'materials',
    transparencyField: EthicalityLevelFieldEnum.MATERIAL,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },
  {
    productTransparencyField: 'materialNaturePercent',
    transparencyField: EthicalityLevelFieldEnum.MATERIAL,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },
  {
    productTransparencyField: 'sdgs',
    transparencyField: EthicalityLevelFieldEnum.SDGS,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },
  {
    productTransparencyField: 'sdgsReport',
    transparencyField: EthicalityLevelFieldEnum.SDGS,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },
  {
    productTransparencyField: 'contributionDetails',
    transparencyField: EthicalityLevelFieldEnum.CONTRIBUTION_DETAIL,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },

  {
    productTransparencyField: 'recycledMaterialPercent',
    transparencyField: EthicalityLevelFieldEnum.USE_OF_RECYCLED_MATERIALS,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },
  {
    productTransparencyField: 'recycledMaterialDescription',
    transparencyField: EthicalityLevelFieldEnum.USE_OF_RECYCLED_MATERIALS,
    type: HighlightTypeEnum.ETHICALITY_LEVEL
  },
  {
    productTransparencyField: 'highlightPoints',
    transparencyField: 'Points you want to highlight',
    type: ''
  },
  {
    productTransparencyField: 'effect',
    transparencyField: 'Effect',
    type: ''
  },
  {
    productTransparencyField: 'culturalProperty',
    transparencyField: 'Cultural Property',
    type: ''
  },
  {
    productTransparencyField: 'rarenessLevel',
    transparencyField: 'Rareness',
    type: ''
  },
  {
    productTransparencyField: 'rarenessDescription',
    transparencyField: 'Rareness',
    type: ''
  }
];

export enum AuditTypes {
  PUBLISH,
  UNPUBLISH,
  EDIT,
  OUT_OF_STOCK
}

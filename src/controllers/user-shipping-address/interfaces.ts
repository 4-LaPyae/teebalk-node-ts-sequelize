import { LanguageEnum } from '../../constants';
import { IUserShippingAddressService } from '../../services';

export interface IUserShippingAddressControllerServices {
  userShippingAddressService: IUserShippingAddressService;
}

export interface IUserShippingAddressRequestModel {
  name: string;
  phone: string;
  postalCode: string;
  country?: string;
  countryCode?: string;
  state: string;
  stateCode?: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  emailAddress?: string;
  language: LanguageEnum;
  default: boolean;
}

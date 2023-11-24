import { IPaginationMetadata } from '../../controllers';
import { IShopDao } from '../../dal';
import {
  ExperienceEventTypeEnum,
  ExperienceOrderStatusEnum,
  IExperienceModel,
  IExperienceOrderDetailModel,
  IExperienceOrderModel,
  IExperienceSessionModel,
  IExperienceSessionTicketReservationModel,
  IGeometry,
  IPaymentTransferModel,
  IUserModel
} from '../../database';
import { IUser } from '../auth';
import { IExperienceInformation } from '../experience/interfaces';

export interface ICreateExperienceOrderModel {
  userId: number;
  paymentIntentId: string;
  paymentTransactionId: number;
  status: ExperienceOrderStatusEnum;
  amount: number;
  usedCoins: number;
  totalAmount: number;
  fiatAmount: number;
  earnedCoins: number;
  shopId: number;
  shopTitle?: string;
  shopEmail: string;
  anonymous: boolean;
  purchaseTimezone: string;
  orderDetailItems: Partial<ICreateExperienceOrderDetailModel>[];
}

export interface ICreateExperienceOrderDetailModel {
  orderId: number;
  experienceId: number;
  sessionId: number;
  sessionTicketId: number;
  experienceTitle: string;
  experienceImage: string;
  eventType: ExperienceEventTypeEnum | null;
  ticketName: string;
  startTime: string;
  endTime: string;
  defaultTimezone: string;
  location: string;
  online: boolean;
  offline: boolean;
  eventLink: string;
  price: number;
  priceWithTax: number;
  quantity: number;
  totalPrice: number;
}

export interface IExperienceOrderReservationPaging {
  rows: IExperienceOrderReservation[];
  metadata: IPaginationMetadata;
  count: number;
}

export interface IExperienceOrderReservation extends IExperienceOrderModel {
  experience: Partial<IExperienceInformation>;
  tickets: ITicketReservation[];
  shop: Partial<IShopDao>;
  session: Partial<IExperienceSessionModel>;
}
export interface ITicketReservation {
  id: number;
  sessionId: number;
  ticketId: number;
  title: string;
  availableUntilMins: number;
  locationCoordinate?: IGeometry;
  location?: string;
  locationPlaceId?: string;
  city?: string;
  country?: string;
  online: boolean;
  offline: boolean;
  eventLink: string;
  eventPassword: string;
  price: number;
  totalPrice: number;
  priceWithTax: number;
  ticketCode: string;
  owner: Partial<IUser> | undefined;
  assigner?: Partial<IUser> | undefined;
}

export interface IExperienceOrderCSVExport extends IExperienceOrderModel {
  username: string;
  email: string;
  user: IUserModel;
  orderDetails: IExperienceOrderDetailReservations[];
  paymentTransfers: IPaymentTransferModel[];
}

export interface IExperienceOrderDetailReservations extends IExperienceOrderDetailModel {
  reservations: IExperienceSessionTicketReservationModel[];
  experience: IExperienceModel;
}

export interface IExperienceOrderCSVDataExport {
  orderId?: number;
  reservationId?: string;
  userId?: number;
  userName?: string;
  userProfession?: string;
  userEmail?: string;
  userAge?: number;
  userGender?: string;
  experienceNameId?: string;
  experienceTitle?: string;
  experienceCategory?: string;
  experienceCategoryType?: string;
  evenStart?: string;
  eventEnd?: string;
  ticketName?: string;
  ticketPrice?: number;
  ticketStatus?: string;
  onlineTicket?: string;
  offlineTicket?: string;
  orderedAt?: string;
  commission?: number;
  totalAmountWithTax?: number;
  payoutAmount?: number;
}

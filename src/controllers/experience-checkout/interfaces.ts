export interface ITicketCheckoutItem {
  ticketId: number;
  purchaseQuantity: number;
  price: number;
  amount: number;
  ticketTitle?: string;
  online?: boolean;
  offline?: boolean;
}

export interface IStatusPurchaseTicket {
  ticketId: number;
  purchaseQuantity: number;
  status?: string;
}

export interface IExperienceFreeTicketRequest {
  experienceNameId: string;
  experienceTitle: string;
  sessionId: number;
  startTime: string;
  endTime: string;
  amount: number;
  tickets: ISessionFreeTicketRequest[];
  anonymous: boolean;
  purchaseTimezone: string;
}

export interface ISessionFreeTicketRequest {
  ticketId: number;
  ticketTitle: string;
  online: boolean;
  offline: boolean;
  purchaseQuantity: number;
  price: number;
  amount: number;
}

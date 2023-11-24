import { InstoreOrderService, IUserService, OrderService, ShopEmailService, ShopService } from '../../services';

export interface IShopEmailControllerServices {
  shopService: ShopService;
  shopEmailService: ShopEmailService;
  orderService: OrderService;
  instoreOrderService: InstoreOrderService;
  userService: IUserService;
}

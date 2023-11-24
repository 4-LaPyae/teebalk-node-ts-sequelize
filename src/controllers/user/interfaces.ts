import { IVibesUser } from '@freewilltokyo/freewill-be';

export interface IVibesUserDataWithCount {
  count: number;
  data: IVibesUser[];
}

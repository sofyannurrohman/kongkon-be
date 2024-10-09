import { Order } from './order.entity';
export const ordersProviders = [
  {
    provide: 'ORDER_REPOSITORY',
    useValue: Order,
  },
];

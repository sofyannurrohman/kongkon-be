import { Cart } from './cart.entity';

export const cartsProviders = [
  {
    provide: 'CART_REPOSITORY',
    useValue: Cart,
  },
];

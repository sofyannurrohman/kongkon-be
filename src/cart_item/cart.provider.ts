import { CartItem } from './cart.entity';

export const cartItemsProviders = [
  {
    provide: 'CART_ITEM_REPOSITORY',
    useValue: CartItem,
  },
];

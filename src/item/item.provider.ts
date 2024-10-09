import { Item } from './item.entity';

export const itemsProviders = [
  {
    provide: 'ITEM_REPOSITORY',
    useValue: Item,
  },
];

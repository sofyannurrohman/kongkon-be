import { Merchant } from './merchant.entity';

export const merchantsProviders = [
  {
    provide: 'MERCHANT_REPOSITORY',
    useValue: Merchant,
  },
];

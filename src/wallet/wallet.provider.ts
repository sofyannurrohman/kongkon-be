import { Wallet } from './wallet.entity';

export const walletsProviders = [
  {
    provide: 'WALLET_REPOSITORY',
    useValue: Wallet,
  },
];

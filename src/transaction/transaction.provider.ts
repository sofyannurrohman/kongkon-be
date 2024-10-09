import { Transaction } from './transaction.entity';
export const transactionsProviders = [
  {
    provide: 'TRANSACTION_REPOSITORY',
    useValue: Transaction,
  },
];

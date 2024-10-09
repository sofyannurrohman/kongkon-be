import { Variant } from './variant.entity';

export const variantsProviders = [
  {
    provide: 'VARIANT_REPOSITORY',
    useValue: Variant,
  },
];

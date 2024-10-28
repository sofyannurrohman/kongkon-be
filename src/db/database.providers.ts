import { Sequelize } from 'sequelize-typescript';
import { Cart } from 'src/cart/cart.entity';
import { CartItem } from 'src/cart_item/cart.entity';
import { Item } from 'src/item/item.entity';
import { Merchant } from 'src/merchant/merchant.entity';
import { Order } from 'src/order/order.entity';
import { Role } from 'src/roles/roles.entity';
import { Transaction } from 'src/transaction/transaction.entity';
import { UserInRoles } from 'src/user-in-roles/user-in-role.entity';
import { User } from 'src/user/user.entity';
import { Variant } from 'src/variant/variant.entity';
import { Wallet } from 'src/wallet/wallet.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: '0.0.0.0',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'postgres',
      });

      sequelize.addModels([
        User,
        Wallet,
        Merchant,
        Item,
        Variant,
        Order,
        Transaction,
        CartItem,
        Cart,
        Role,
        UserInRoles,
      ]);
      await sequelize.sync();
      return sequelize;
    },
  },
];

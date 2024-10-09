import { Inject, Injectable } from '@nestjs/common';
import { Wallet } from './wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @Inject('WALLET_REPOSITORY')
    private walletRepository: typeof Wallet,
  ) {}

  async create(user_id: string): Promise<Wallet> {
    const newWallet = await this.walletRepository.create({
      user_id: user_id,
      saldo: 0,
    });
    return newWallet;
  }
}

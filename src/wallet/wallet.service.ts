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
  async findWalletByUserId(userId: string): Promise<Wallet> {
    return this.walletRepository.findOne({ where: { user_id: userId } });
  }

  async addBalance(userId: string, amount: number): Promise<void> {
    const wallet = await this.findWalletByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`);
    }

    wallet.saldo += amount;
    await wallet.save();
  }
  async useBalance(userId: string, amount: number): Promise<void> {
    const wallet = await this.findWalletByUserId(userId);
    if (!wallet) {
      throw new Error(`Wallet not found for user ID: ${userId}`);
    }

    wallet.saldo -= amount;
    await wallet.save();
  }
}

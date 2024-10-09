import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Merchant } from './merchant.entity';
import { CreateMerchantDto } from './dto/create_merchant.dto';
import { Sequelize } from 'sequelize';
import { UpdateMerchantDto } from './dto/update_merchant.dto';

@Injectable()
export class MerchantService {
  constructor(
    @Inject('MERCHANT_REPOSITORY')
    private merchantRepository: typeof Merchant,
  ) {}

  async create(
    merchantData: CreateMerchantDto,
    user_id: string,
  ): Promise<Merchant> {
    const newMerchant = await this.merchantRepository.create({
      name: merchantData.name,
      rating: 0,
      description: merchantData.description,
      filename: '',
      user_id: user_id,
      is_available: false,
      location: Sequelize.fn(
        'ST_GeomFromText',
        `POINT(${merchantData.location.longitude} ${merchantData.location.latitude})`,
        4326, // SRID for WGS 84
      ),
    });
    if (!newMerchant) {
      throw new HttpException('Failed create merchant', HttpStatus.BAD_REQUEST);
    }
    return newMerchant;
  }
  async findByID(id: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findByPk(id);
    if (!merchant) {
      throw new HttpException('Merchant not found', HttpStatus.NOT_FOUND);
    }
    return merchant;
  }
  async findAll(): Promise<Merchant[]> {
    const merchants = await this.merchantRepository.findAll();
    if (!merchants) {
      throw new HttpException('Merchant not found', HttpStatus.NOT_FOUND);
    }
    return merchants;
  }
  async delete(id: string): Promise<boolean> {
    const result = await this.merchantRepository.destroy({ where: { id } });
    return result > 0;
  }
  async update(id: string, request: UpdateMerchantDto): Promise<Merchant> {
    const user = await this.merchantRepository.findByPk(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await user.update(request); // Update the user with new data
    return user;
  }
  async getMerchantLocation(merchantId: string): Promise<any> {
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId },
      attributes: [
        'id',
        [Sequelize.fn('ST_AsText', Sequelize.col('location')), 'location'],
      ],
    });

    if (!merchant) {
      throw new Error('Merchant location not found');
    }

    // Cast to unknown and then to string to satisfy TypeScript
    const locationText = (
      merchant.getDataValue('location') as unknown as string
    )
      .replace('POINT(', '')
      .replace(')', '');

    // Split and convert coordinates
    const coordinates = locationText.split(' ');
    return {
      latitude: parseFloat(coordinates[1]),
      longitude: parseFloat(coordinates[0]),
    };
  }
}

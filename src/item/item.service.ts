import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create_item.dto';
import { VariantService } from 'src/variant/variant.service';
import { CreateVariantDto } from 'src/variant/dto/create_variant.dto';
import { Sequelize } from 'sequelize-typescript'; // Needed for transaction management

@Injectable()
export class ItemService {
  constructor(
    @Inject('ITEM_REPOSITORY') private itemRepository: typeof Item,
    private variantService: VariantService,
    @Inject('SEQUELIZE') private sequelize: Sequelize, // Inject Sequelize instance
    // For transaction support
  ) {}
  async register(
    itemData: CreateItemDto,
    variantData: CreateVariantDto[],
    merchant_id: string,
  ): Promise<Item> {
    const transaction = await this.sequelize.transaction(); // Start transaction
    try {
      // Create a new item
      const newItem = await this.itemRepository.create(
        {
          name: itemData.name,
          rating: itemData.rating || 0,
          description: itemData.description,
          filename: '',
          price: itemData.price,
          type: itemData.type,
          customize: itemData.customize,
          is_available: itemData.is_available,
          merchant_id: merchant_id,
        },
        { transaction }, // Pass the transaction to the query
      );

      // Create variants if item has customization enabled
      if (newItem.customize === true && variantData && variantData.length > 0) {
        await this.variantService.create(newItem.id, variantData, transaction); // Pass transaction
      }

      await transaction.commit(); // Commit the transaction if all succeeded
      return newItem;
    } catch (error) {
      await transaction.rollback(); // Rollback transaction if any error occurs
      throw new BadRequestException(
        'Failed to register item with variants',
        error.message,
      );
    }
  }
  async findAll(): Promise<Item[]> {
    const items = await this.itemRepository.findAll();
    return items;
  }
  async findAllByMerchantID(merchant_id: string): Promise<Item[]> {
    const items = await this.itemRepository.findAll({
      where: { merchant_id: merchant_id },
    });
    return items;
  }
  async findByID(id: string): Promise<Item> {
    const item = await this.itemRepository.findByPk(id);
    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }
    return item;
  }
  async delete(id: number): Promise<boolean> {
    const result = await this.itemRepository.destroy({ where: { id } });
    return result > 0;
  }
}

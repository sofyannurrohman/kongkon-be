import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create_item.dto';
import { CreateVariantDto } from 'src/variant/dto/create_variant.dto';
import { WebResponse } from 'src/model/web.model';
import { Item } from './item.entity';

@Controller('items')
export class ItemController {
  constructor(private itemService: ItemService) {}
  @Post(':merchant_id')
  async createItem(
    @Param('merchant_id') merchant_id: string, // Get merchant_id from route param
    @Body('item') itemData: CreateItemDto, // Get item data from request body
    @Body('variants') variantData: CreateVariantDto[], // Get variants array from request body
  ) {
    const newItem = await this.itemService.register(
      itemData,
      variantData,
      merchant_id,
    );
    return newItem;
  }
  @Get()
  async getAllItem(): Promise<WebResponse<Item[]>> {
    const result = await this.itemService.findAll();
    return {
      status: 'success',
      code: 200,
      message: 'Successfully get all item',
      data: result,
    };
  }
  @Get()
  async getItemByID(@Param(':id') id: string): Promise<WebResponse<Item>> {
    const result = await this.itemService.findByID(id);
    return {
      status: 'success',
      code: 200,
      message: 'Successfully get item by id',
      data: result,
    };
  }
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<{ message: string }> {
    const deleted = await this.itemService.delete(id);
    if (!deleted) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Item successfully deleted' };
  }
}

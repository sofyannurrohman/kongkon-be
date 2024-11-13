import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { WebResponse } from 'src/model/web.model';
import { Merchant } from './merchant.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateMerchantDto } from './dto/create_merchant.dto';

@Controller('merchants')
export class MerchantController {
  constructor(private merchantService: MerchantService) {}

  @UseGuards(AuthGuard)
  @Post()
  async register(
    @Body() data: CreateMerchantDto,
    @Request() req,
  ): Promise<WebResponse<Merchant>> {
    const result = await this.merchantService.create(data, req.user.id);
    return {
      status: 'success',
      code: 200,
      message: 'Successfully created new merchant',
      data: result,
    };
  }
  @Get()
  async getAll(): Promise<WebResponse<Merchant[]>> {
    const result = await this.merchantService.findAll();
    return {
      status: 'success',
      code: 200,
      message: 'Successfully get all merchant',
      data: result,
    };
  }
  @Get(':id')
  async getByID(@Param('id') id: string): Promise<WebResponse<Merchant>> {
    const result = await this.merchantService.findByID(id);
    return {
      status: 'success',
      code: 200,
      message: 'Successfully get merchant by id',
      data: result,
    };
  }
  @Get(':id/with-items')
  async getByIDWithItem(
    @Param('id') id: string,
  ): Promise<WebResponse<Merchant>> {
    const result = await this.merchantService.findByIDWithItems(id);
    return {
      status: 'success',
      code: 200,
      message: 'Successfully get merchant by id',
      data: result,
    };
  }
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    const deleted = await this.merchantService.delete(id);
    if (!deleted) {
      throw new HttpException('Merchant not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Merchant successfully deleted' };
  }
}

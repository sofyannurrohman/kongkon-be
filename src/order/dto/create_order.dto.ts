import {
  IsNotEmpty,
  IsString,
  IsObject,
  IsArray,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Point } from 'geojson';
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customer_id: string;

  @IsString()
  @IsNotEmpty()
  merchant_id: string;

  @IsObject()
  @IsNotEmpty()
  from_location: Point;

  @IsObject()
  @IsNotEmpty()
  to_location: Point;

  @IsString()
  order_type: string;

  @IsOptional()
  work_date?: Date;

  @IsArray()
  items: Array<{
    item_id: number;
    quantity: number;
    note?: string;
    variant_id?: number;
  }>;
}

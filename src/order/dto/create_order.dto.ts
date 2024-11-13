import { IsNotEmpty, IsNumber, IsString, IsObject } from 'class-validator';
import { Point } from 'geojson'; // GeoJSON type

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customer_id: string;

  @IsString()
  @IsNotEmpty()
  merchant_id: string;

  @IsString()
  partner_id: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsObject()
  @IsNotEmpty()
  from_location: Point; // GeoJSON Point

  @IsObject()
  @IsNotEmpty()
  to_location: Point; // GeoJSON Point

  @IsString()
  order_type: string;

  @IsString()
  work_date: string;

  @IsNumber()
  merchant_profit: number;

  @IsNumber()
  partner_profit: number;
  @IsNumber()
  cart_id: number;
}

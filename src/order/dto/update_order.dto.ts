import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Point } from 'geojson';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  customer_id?: string;

  @IsOptional()
  @IsString()
  merchant_id?: string;

  @IsOptional()
  @IsString()
  partner_id?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  from_location?: Point;

  @IsOptional()
  to_location?: Point;

  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @IsOptional()
  @IsString()
  order_type?: string;

  @IsOptional()
  @IsString()
  work_date?: string;
  @IsOptional()
  @IsNumber()
  merchant_profit?: number;
  @IsOptional()
  @IsNumber()
  partner_profit?: number;
}

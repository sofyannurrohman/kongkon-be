import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  customer_id: string;
  @IsNotEmpty()
  @IsString()
  merchant_id: string;
  @IsNotEmpty()
  @IsString()
  partner_id: string;

  @IsNotEmpty()
  @IsString()
  status: string; // Should initially be 'pending'

  @IsNotEmpty()
  from_location: object; // Geometry point for merchant's location

  @IsNotEmpty()
  to_location: object; // Geometry point for customer's location

  @IsNotEmpty()
  @IsNumber()
  total_amount: number;

  @IsNotEmpty()
  @IsString()
  order_type: string; // Type of the order (e.g., food, parcel)

  @IsNotEmpty()
  @IsString()
  work_date: string; // Expected date of work/delivery
}

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RematchDto {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsNotEmpty()
  @IsString()
  customerId: string;
}

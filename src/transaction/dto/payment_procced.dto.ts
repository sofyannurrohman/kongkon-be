import { IsNotEmpty, IsNumber } from 'class-validator';

export class ProcessPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  orderId: number;
}

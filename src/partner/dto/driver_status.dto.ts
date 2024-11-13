import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DriverStatusDto {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsNotEmpty()
  @IsString()
  status: string;
}

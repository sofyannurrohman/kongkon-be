import { IsNotEmpty, IsString } from 'class-validator';

export class DriverStatusDto {
  @IsNotEmpty()
  @IsString()
  orderId: number;

  @IsNotEmpty()
  @IsString()
  status: string;
}

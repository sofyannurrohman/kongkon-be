import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCartDto {
  @IsNotEmpty()
  @IsString()
  customer_id;
  @IsOptional()
  status?: 'active' | 'completed' | 'abandoned';

  @IsOptional()
  @IsNumber()
  total_amount?: number;
}

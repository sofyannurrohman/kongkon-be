import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateVariantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsNumber()
  additional_price: number;
}

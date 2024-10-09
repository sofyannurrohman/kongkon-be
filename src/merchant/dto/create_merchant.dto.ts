import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PointDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class CreateMerchantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateNested()
  @Type(() => PointDto)
  location: PointDto;
}

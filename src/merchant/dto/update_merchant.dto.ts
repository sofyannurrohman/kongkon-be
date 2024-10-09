import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class PointDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class UpdateMerchantDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PointDto)
  location: PointDto;
  @IsOptional()
  @IsBoolean()
  is_available: boolean;
}

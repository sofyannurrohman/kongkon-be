import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class FindNearbyDriversDto {
  @IsNotEmpty()
  @IsString()
  merchantId: string;

  @IsNotEmpty()
  @IsNumber()
  radiusInMeters: number;
}

export class NearbyDriverResponseDto {
  id: string;
}

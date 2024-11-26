import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateCustomerDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly phone_number: string;
  license_plate?: string;
}

export class UserLogin {
  @IsEmail()
  email?: string;
  @MinLength(8)
  password: string;
}

export class UpdateUserRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  avatar_file_name?: string;

  @IsOptional()
  @IsString()
  role_id?: string;

  @IsOptional()
  @IsString()
  license_number?: string;

  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}

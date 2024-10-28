import { IsString, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description?: string;
}

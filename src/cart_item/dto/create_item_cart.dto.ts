import { IsArray } from 'class-validator';

export class CreateCartItemDto {
  @IsArray()
  items: Array<{
    item_id: number;
    quantity: number;
    note?: string;
    variant_id?: number;
    
  }>;
}

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

export class Calculate {
  @IsArray()
  items: Array<{
    item_id: number;
    quantity: number;
    note?: string;
    variant_id?: number;
  }>;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
}

export class CreateCartSingleItemDto {
  item_id: number;
  item_qty: number;
  note?: string;
  variant_id?: number;
}

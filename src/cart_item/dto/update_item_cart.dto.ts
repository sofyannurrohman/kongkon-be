export class UpdateCartItemDto {
  items?: {
    item_id: string;
    item_qty: number;
    variant_id?: number;
    note?: string;
  }[];
}

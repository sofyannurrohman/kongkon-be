// dto/update-cart-item.dto.ts
export class UpdateCartItemDto {
  item_id: string; // ID of the item to update
  item_qty: number; // New quantity
  variant_id?: number; // Optional variant
  note?: string; // Optional note
}

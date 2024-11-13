export class CartItemDto {
    itemId: number;
    quantity: number;
    item: {
      name: string;
      merchant: {
        id: number;
        name: string;
      };
    };
  }
  
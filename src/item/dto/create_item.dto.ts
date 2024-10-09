export class CreateItemDto {
  name: string;
  description: string;
  price: number;
  type: string;
  customize: boolean;
  is_available: boolean;
  rating?: number; // Optional, with default value in service
}

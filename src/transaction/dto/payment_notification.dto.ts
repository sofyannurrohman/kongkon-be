export class PaymentNotificationDto {
  transaction_status: string;
  order_id: number;
  gross_amount: number;
  payment_type: string;
  transaction_time: string;
  fraud_status: string;
  signature_key: string; // Verify this signature for security
}

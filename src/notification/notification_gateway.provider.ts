import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  // Method to handle when a user joins a room
  handleConnection(client: Socket) {
    // Logic to determine which rooms to join
    // e.g., client.join(`order_${orderId}`);
  }

  // Notify customer when order is matched
  notifyCustomer(customerId: string, notification: any) {
    this.server.to(customerId).emit('order-matched', notification);
  }

  // Notify merchant about driver details
  notifyMerchant(merchantId: string, notification: any) {
    this.server.to(merchantId).emit('driver-assigned', notification);
  }

  // Notify driver about new order
  notifyDriver(driverId: string, notification: any) {
    this.server.to(driverId).emit('new-order', notification);
  }
}

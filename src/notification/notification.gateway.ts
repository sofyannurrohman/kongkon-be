import {
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust this to restrict origins
  },
})
@WebSocketGateway()
export class NotificationGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket Server Initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId; // Extract userId from the query params
    if (userId) {
      console.log(`User ${userId} connected`);
      client.join(`user-${userId}-notifications`); // Join the specific room for the user
      console.log(`User ${userId} joined room: user-${userId}-notifications`);
    } else {
      console.log('User ID not provided in WebSocket connection');
    }
  }

  // Method to join a user to a general notification room
  joinGeneralRoom(userId: string) {
    this.server.to(`user-${userId}-notifications`).emit('notification', {
      message: 'Welcome to the notification room!',
    });
  }

  // Method to notify the customer
  notifyCustomer(customerId: string, message: any) {
    console.log(
      `Notifying customer ${customerId} with message: ${JSON.stringify(message)}`,
    );
    this.server
      .to(`user-${customerId}-notifications`)
      .emit('notification', message);
  }
  notifyDriver(driverId: string, message: any) {
    this.server
      .to(`user-${driverId}-notifications`)
      .emit('notification', message);
  }
  private pendingResponses = new Map<
    string,
    { resolve: (value?: string) => void; reject: (reason?: any) => void }
  >();

  @SubscribeMessage('driverResponse')
  handleDriverResponse(
    @MessageBody()
    data: {
      driverId: string;
      orderId: string;
      accepted: boolean;
    },
  ) {
    const responseKey = `${data.driverId}-${data.orderId}`;

    // Check if there is a pending response
    if (this.pendingResponses.has(responseKey)) {
      const { resolve } = this.pendingResponses.get(responseKey)!; // Use non-null assertion operator

      // Emit the response back to the event that was awaiting it
      this.server.emit(`driver-${data.driverId}-response`, {
        accepted: data.accepted,
        orderId: data.orderId,
      });

      // Resolve the promise based on the driver's response
      resolve(data.accepted ? 'accepted' : 'declined');

      // Remove the resolved response from pending responses
      this.pendingResponses.delete(responseKey);
    } else {
      console.log(
        `No pending response found for driver ${data.driverId} and order ${data.orderId}`,
      );
    }
  }
  // Notify the driver and wait for their response
  async notifyAssignedDriver(
    driverId: string,
    orderId: string,
  ): Promise<string> {
    const responseKey = `${driverId}-${orderId}`;

    return new Promise<string>((resolve, reject) => {
      console.log(
        `Waiting for driver ${driverId} response for order ${orderId}`,
      );

      // Store the resolve and reject functions in the pendingResponses map
      this.pendingResponses.set(responseKey, { resolve, reject });

      // Timeout handling
      setTimeout(() => {
        if (this.pendingResponses.has(responseKey)) {
          console.log(
            `Driver ${driverId} did not respond in time for order ID: ${orderId}`,
          );
          reject('timeout'); // Reject the promise if the timeout occurs
          this.pendingResponses.delete(responseKey); // Clean up
        }
      }, 10000); // 10 seconds timeout
    });
  }

  async waitForDriverResponse(
    driverId: string,
    orderId: string,
  ): Promise<'accepted' | 'declined'> {
    return new Promise<'accepted' | 'declined'>((resolve, reject) => {
      console.log(
        `Waiting for driver ${driverId} response for order ${orderId}`,
      );

      // Listen for the driver's response only once
      this.server.once(
        `driver-2756f5c1-36ee-43c7-8849-2c8052035dc8-response`,
        (response: { accepted: boolean; orderId: string }) => {
          console.log(
            `Received response from driver ${driverId} for order ${orderId}: ${response.accepted}`,
          );
          // Resolve the promise based on the driver's response
          if (response.accepted) {
            resolve('accepted');
          } else {
            resolve('declined');
          }
        },
      );

      // Optional: Implement a timeout in case the driver doesn't respond
      setTimeout(() => {
        reject('timeout');
      }, 30000); // 30-second timeout
    });
  }
  // Method to notify the merchant
  notifyMerchant(merchantId: string, message: any) {
    this.server
      .to(`user-${merchantId}-notifications`)
      .emit('notification', message);
  }

  async notifyDriverStatustoCustomer(customerId: string, payload: any) {
    this.server.to(`customer-${customerId}`).emit('driver-status', payload);
  }

  async DriverStatusto(merchantId: string, payload: any) {
    this.server.to(`merchant-${merchantId}`).emit('driver-status', payload);
  }
}

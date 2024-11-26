import {
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import Redis from 'ioredis';
@WebSocketGateway({
  cors: {
    origin: '*', // Adjust this to restrict origins
    methods: ['GET', 'POST'],
  },
})
@WebSocketGateway()
export class NotificationGateway implements OnGatewayInit {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('REDIS_PUBLISHER_CLIENT') private readonly redisPublisher: Redis,
    @Inject('REDIS_SUBSCRIBER_CLIENT') private readonly redisSubscriber: Redis,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    // Subscribe to a Redis channel using the subscriber client
    this.redisSubscriber.on('connect', () => {
      console.log('Connected to Redis as subscriber');
    });

    this.redisSubscriber.subscribe('your_channel', (error, count) => {
      if (error) {
        console.error('Failed to subscribe:', error);
      } else {
        console.log(
          `Subscribed successfully! This client is currently subscribed to ${count} channels.`,
        );
      }
    });

    // Handle messages received from Redis
    this.redisSubscriber.on('message', (channel, message) => {
      console.log(`Received message from ${channel}:`, message);
      this.server.emit('message', message); // Emit message to WebSocket clients
    });
  }

  // Example method to publish messages
  async publishMessage(channel: string, message: string) {
    await this.redisPublisher.publish(channel, message);
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
  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId;
    console.log(`User ${userId} disconnected`);
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
  async handleDriverResponse(
    @MessageBody()
    data: {
      driverId: string;
      orderId: string;
      accepted: boolean;
    },
  ) {
    const responseKey = `pendingResponse:${data.driverId}:${data.orderId}`; // Keep this as is
    console.log(data);
    // Check if there is a pending response in memory
    if (this.pendingResponses.has(responseKey)) {
      const { resolve } = this.pendingResponses.get(responseKey)!;

      // Emit response back to the specific driver
      this.server.emit(`driver-${data.driverId}-response`, {
        accepted: data.accepted,
        orderId: data.orderId,
      });

      resolve(data.accepted ? 'accepted' : 'declined'); // Fulfill the promise

      // Clean up Redis and in-memory references
      await this.cacheManager.del(responseKey);
      this.pendingResponses.delete(responseKey);
    } else {
      console.log(
        `No pending response found for driver ${data.driverId} and order ${data.orderId}`,
      );
    }
  }

  async notifyAssignedDriver(
    driverId: string,
    orderId: string,
    options: { responseOptions?: string[] } = {
      responseOptions: ['accept', 'decline'],
    },
  ): Promise<string> {
    const responseKey = `pendingResponse:${driverId}:${orderId}`; // Use colon to match handleDriverResponse
    const driverRoom = `user-${driverId}-notifications`; // Use the actual driver ID here

    return new Promise<string>((resolve, reject) => {
      // Store the response handlers in memory
      this.pendingResponses.set(responseKey, { resolve, reject });

      // Notify the driver via WebSocket with response options
      this.server.to(driverRoom).emit('orderAssignment', {
        orderId,
        message: `You have been assigned to order ${orderId}. Please respond.`,
        responseOptions: options.responseOptions, // Provide "accept" and "decline" options
      });
      console.log(
        `Waiting for driver ${driverId} response for order ${orderId}`,
      );

      // Store in Redis with a 30-second TTL for persistence
      this.cacheManager.set(responseKey, JSON.stringify({ resolve }), 30); // Use ttl option correctly

      // Set a timeout to automatically reject if no response is received within 30 seconds
      setTimeout(() => {
        if (this.pendingResponses.has(responseKey)) {
          console.log(
            `Driver ${driverId} did not respond in time for order ID: ${orderId}`,
          );
          this.pendingResponses.get(responseKey)?.reject('timeout');
          this.pendingResponses.delete(responseKey); // Clean up
          this.cacheManager.del(responseKey); // Clean up Redis
        }
      }, 30000); // 30-second timeout
    });
  }

  async waitForDriverResponse(
    driverId: string,
    orderId: string,
  ): Promise<'accepted' | 'declined'> {
    return new Promise<'accepted' | 'declined'>((resolve, reject) => {
      const responseEvent = `driver-${driverId}-response`;

      // Listen for the driver’s response
      this.server.once(
        responseEvent,
        (response: { orderId: string; action: 'accepted' | 'declined' }) => {
          if (response.orderId === orderId) {
            console.log(
              `Driver ${driverId} responded with: ${response.action}`,
            );
            resolve(response.action);
          }
        },
      );

      // Set a timeout to handle cases where the driver does not respond
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
    console.log(`Notified ${merchantId} Merchant ${JSON.stringify(message)}`);
  }

  async notifyDriverStatustoCustomer(customerId: string, payload: any) {
    this.server.to(`customer-${customerId}`).emit('driver-status', payload);
  }

  async DriverStatusto(merchantId: string, payload: any) {
    this.server.to(`merchant-${merchantId}`).emit('driver-status', payload);
  }
}

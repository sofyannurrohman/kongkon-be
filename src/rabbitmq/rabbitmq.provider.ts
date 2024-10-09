import { Injectable } from '@nestjs/common';
import {
  connect,
  AmqpConnectionManager as AmqpConnManager,
  ChannelWrapper,
} from 'amqp-connection-manager';

@Injectable()
export class AmqpConnectionManager {
  private connection: AmqpConnManager;

  constructor() {
    this.connection = connect(['amqp://localhost']);
  }

  createChannel(channelSetup: (channel: any) => Promise<any>): ChannelWrapper {
    return this.connection.createChannel({
      setup: channelSetup,
    });
  }
}

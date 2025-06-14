import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, NatsConnection, Subscription, JSONCodec } from 'nats';

@Injectable()
export class NatsService implements OnModuleDestroy {
  private readonly logger = new Logger(NatsService.name);
  private connection: NatsConnection;
  private jsonCodec = JSONCodec();

  constructor(private configService: ConfigService) {
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    const natsUrl = this.configService.get<string>('NATS_URL') || 'nats://localhost:4222';
    
    try {
      this.connection = await connect({
        servers: [natsUrl],
        reconnect: true,
        maxReconnectAttempts: 10,
        reconnectTimeWait: 2000,
      });

      this.logger.log('Connected to NATS');

      // Handle connection events
      (async () => {
        for await (const status of this.connection.status()) {
          this.logger.log(`NATS connection status: ${status.type}`);
        }
      })();

    } catch (error) {
      this.logger.error('Failed to connect to NATS:', error);
    }
  }

  async publish(subject: string, data: any): Promise<void> {
    try {
      if (!this.connection) {
        throw new Error('NATS connection not established');
      }

      this.connection.publish(subject, this.jsonCodec.encode(data));
      this.logger.debug(`Published message to subject: ${subject}`);
    } catch (error) {
      this.logger.error(`Error publishing to subject ${subject}:`, error);
      throw error;
    }
  }

  async subscribe(
    subject: string,
    callback: (data: any, subject: string) => void | Promise<void>,
  ): Promise<Subscription> {
    try {
      if (!this.connection) {
        throw new Error('NATS connection not established');
      }

      const subscription = this.connection.subscribe(subject);
      
      (async () => {
        for await (const message of subscription) {
          try {
            const data = this.jsonCodec.decode(message.data);
            await callback(data, message.subject);
          } catch (error) {
            this.logger.error(`Error processing message from ${subject}:`, error);
          }
        }
      })();

      this.logger.log(`Subscribed to subject: ${subject}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Error subscribing to subject ${subject}:`, error);
      throw error;
    }
  }

  async request(subject: string, data: any, timeout: number = 5000): Promise<any> {
    try {
      if (!this.connection) {
        throw new Error('NATS connection not established');
      }

      const response = await this.connection.request(
        subject,
        this.jsonCodec.encode(data),
        { timeout },
      );

      return this.jsonCodec.decode(response.data);
    } catch (error) {
      this.logger.error(`Error making request to subject ${subject}:`, error);
      throw error;
    }
  }

  async subscribeToQueue(
    subject: string,
    queueGroup: string,
    callback: (data: any, subject: string) => void | Promise<void>,
  ): Promise<Subscription> {
    try {
      if (!this.connection) {
        throw new Error('NATS connection not established');
      }

      const subscription = this.connection.subscribe(subject, { queue: queueGroup });
      
      (async () => {
        for await (const message of subscription) {
          try {
            const data = this.jsonCodec.decode(message.data);
            await callback(data, message.subject);
          } catch (error) {
            this.logger.error(`Error processing queued message from ${subject}:`, error);
          }
        }
      })();

      this.logger.log(`Subscribed to queue subject: ${subject} (group: ${queueGroup})`);
      return subscription;
    } catch (error) {
      this.logger.error(`Error subscribing to queue subject ${subject}:`, error);
      throw error;
    }
  }

  async publishWorkflowEvent(event: string, data: any): Promise<void> {
    await this.publish(`workflow.${event}`, {
      timestamp: new Date().toISOString(),
      event,
      data,
    });
  }

  async subscribeToWorkflowEvents(
    event: string,
    callback: (data: any) => void | Promise<void>,
  ): Promise<Subscription> {
    return this.subscribe(`workflow.${event}`, async (message) => {
      await callback(message.data);
    });
  }

  async publishServiceEvent(service: string, event: string, data: any): Promise<void> {
    await this.publish(`service.${service}.${event}`, {
      timestamp: new Date().toISOString(),
      service,
      event,
      data,
    });
  }

  async subscribeToServiceEvents(
    service: string,
    event: string,
    callback: (data: any) => void | Promise<void>,
  ): Promise<Subscription> {
    return this.subscribe(`service.${service}.${event}`, async (message) => {
      await callback(message.data);
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.logger.log('NATS connection closed');
    }
  }
}
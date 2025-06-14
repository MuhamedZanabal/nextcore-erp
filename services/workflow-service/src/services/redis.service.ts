import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(private configService: ConfigService) {
    this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    
    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}:`, error);
      return false;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hGet(key, field);
    } catch (error) {
      this.logger.error(`Error getting hash field ${field} from ${key}:`, error);
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      await this.client.hSet(key, field, value);
      return true;
    } catch (error) {
      this.logger.error(`Error setting hash field ${field} in ${key}:`, error);
      return false;
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      this.logger.error(`Error getting all hash fields from ${key}:`, error);
      return null;
    }
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.lPush(key, values);
    } catch (error) {
      this.logger.error(`Error pushing to list ${key}:`, error);
      return 0;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rPop(key);
    } catch (error) {
      this.logger.error(`Error popping from list ${key}:`, error);
      return null;
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.client.lLen(key);
    } catch (error) {
      this.logger.error(`Error getting list length ${key}:`, error);
      return 0;
    }
  }

  async publish(channel: string, message: string): Promise<boolean> {
    try {
      await this.client.publish(channel, message);
      return true;
    } catch (error) {
      this.logger.error(`Error publishing to channel ${channel}:`, error);
      return false;
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      const subscriber = this.client.duplicate();
      await subscriber.connect();
      
      await subscriber.subscribe(channel, (message) => {
        callback(message);
      });
    } catch (error) {
      this.logger.error(`Error subscribing to channel ${channel}:`, error);
    }
  }

  async setJson(key: string, value: any, ttl?: number): Promise<boolean> {
    return this.set(key, JSON.stringify(value), ttl);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error parsing JSON for key ${key}:`, error);
      return null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }
}
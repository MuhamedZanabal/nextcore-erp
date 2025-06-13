import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockModule } from './modules/stock/stock.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { MovementsModule } from './modules/movements/movements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'nextcore'),
        password: configService.get('DB_PASSWORD', 'nextcore'),
        database: configService.get('DB_DATABASE', 'nextcore'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNC', false),
        logging: configService.get('DB_LOGGING', false),
      }),
    }),
    
    StockModule,
    WarehousesModule,
    MovementsModule,
  ],
})
export class AppModule {}

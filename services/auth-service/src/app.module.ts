import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { RolesModule } from './modules/roles/roles.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'postgres'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'nextcore'),
        password: configService.get('DB_PASSWORD', 'nextcore'),
        database: configService.get('DB_DATABASE', 'nextcore'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNC', 'false') === 'true',
        logging: configService.get('DB_LOGGING', 'false') === 'true',
        ssl: configService.get('DB_SSL', 'false') === 'true' ? {
          rejectUnauthorized: configService.get('DB_SSL_REJECT_UNAUTHORIZED', 'false') === 'true'
        } : false,
      }),
    }),
    
    // Feature modules
    AuthModule,
    UsersModule,
    TenantsModule,
    RolesModule,
  ],
})
export class AppModule {}
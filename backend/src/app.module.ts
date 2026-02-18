import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Product } from './shared/entities/product.entity';
import { User } from './shared/entities/user.entity';
import { Admin } from './shared/entities/admin.entity';
import { Order } from './shared/entities/order.entity';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AdminModule } from './modules/admin/admin.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('DATABASE_URL');
        const isProd = configService.get<string>('NODE_ENV') === 'production';

        if (url) {
          return {
            type: 'postgres',
            url,
            entities: [Product, User, Admin, Order],
            synchronize: true, // Temporary fix for new database
            ssl: {
              rejectUnauthorized: false,
            },
            extra: {
              ssl: {
                rejectUnauthorized: false,
              },
            },
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [Product, User, Admin, Order],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    ProductsModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

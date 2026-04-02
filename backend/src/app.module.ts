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
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        let url = configService.get<string>('DATABASE_URL');

        if (url) {
          // Fix for Neon DB "Tenant or user not found" SNI error
          if (url.includes('neon.tech') && !url.includes('options=project')) {
            try {
              const parsedUrl = new URL(url);
              const endpointId = parsedUrl.hostname.split('.')[0];
              parsedUrl.searchParams.set('options', `project=${endpointId}`);
              url = parsedUrl.toString();
            } catch (error) {
              console.warn('Could not parse DATABASE_URL for Neon options fix');
            }
          }

          // Fix for Supabase pooler - ensure using session mode (port 6543)
          if (url.includes('supabase.com') && url.includes(':5432')) {
            try {
              console.warn('⚠️  Supabase connection detected with port 5432. Switching to session mode (port 6543) for better compatibility.');
              url = url.replace(':5432', ':6543');
            } catch (error) {
              console.warn('Could not adjust Supabase port');
            }
          }

          return {
            type: 'postgres',
            url,
            entities: [Product, User, Admin, Order],
            autoLoadEntities: true,
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
          autoLoadEntities: true,
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
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
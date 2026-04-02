import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Admin } from '../../shared/entities/admin.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Admin]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_SECRET'),
                signOptions: { expiresIn: '1d' },
            }),
            inject: [ConfigService],
        }),
        ProductsModule,
        OrdersModule,
        CloudinaryModule,
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }

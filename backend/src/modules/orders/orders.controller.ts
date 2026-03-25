import { Controller, Get, Post, Patch, Body, Param, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { PaymentStatus } from '../../shared/entities/order.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new order' })
    @UseInterceptors(FileInterceptor('screenshot', {
        storage: diskStorage({
            destination: './uploads/orders',
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => Math.round(Math.random() * 16).toString(16))
                    .join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    async createOrder(@Body() orderData: any, @UploadedFile() file: Express.Multer.File) {
        if (typeof orderData.items === 'string') {
            try {
                orderData.items = JSON.parse(orderData.items);
            } catch (e) {
                throw new BadRequestException('Invalid items format');
            }
        }
        if (typeof orderData.customer === 'string') {
            try {
                orderData.customer = JSON.parse(orderData.customer);
            } catch (e) {
                throw new BadRequestException('Invalid customer format');
            }
        }

        let screenshotPath: string | null = null;
        if (file) {
            screenshotPath = `/uploads/orders/${file.filename}`;
        }

        return this.ordersService.create({ ...orderData, paymentScreenshot: screenshotPath });
    }

    @Get('user')
    @ApiOperation({ summary: 'Get user orders by email or phone' })
    async getUserOrders(@Query('email') email?: string, @Query('phone') phone?: string) {
        return this.ordersService.findByUser(email, phone);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order by ID' })
    async getOrderById(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Patch(':orderId/payment-status')
    @ApiOperation({ summary: 'Update payment status' })
    async updatePaymentStatus(
        @Param('orderId') orderId: string,
        @Body('paymentStatus') paymentStatus: PaymentStatus,
    ) {
        return this.ordersService.updatePaymentStatus(orderId, paymentStatus);
    }
}

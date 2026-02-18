import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { PaymentStatus } from '../../shared/entities/order.entity';

@ApiTags('Orders')
@Controller('api/orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new order' })
    async createOrder(@Body() orderData: any) {
        return this.ordersService.create(orderData);
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

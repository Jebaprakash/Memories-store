import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, PaymentStatus, OrderStatus } from '../../shared/entities/order.entity';
import { MailService } from '../../shared/services/mail.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        private mailService: MailService,
    ) { }

    async create(orderData: any) {
        const order = this.orderRepository.create(orderData);
        const savedOrder = await this.orderRepository.save(order);
        return {
            success: true,
            message: 'Order created successfully',
            order: savedOrder,
        };
    }

    async findOne(id: string) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        return {
            success: true,
            data: order,
        };
    }

    async findByUser(email?: string, phone?: string) {
        if (!email && !phone) {
            return { success: false, message: 'Email or phone is required' };
        }

        const qb = this.orderRepository.createQueryBuilder('order');

        if (email && phone) {
            qb.where("order.customer->>'email' = :email OR order.customer->>'phone' = :phone", { email, phone });
        } else if (email) {
            qb.where("order.customer->>'email' = :email", { email });
        } else {
            qb.where("order.customer->>'phone' = :phone", { phone });
        }

        qb.orderBy('order.createdAt', 'DESC');
        const orders = await qb.getMany();

        return {
            success: true,
            data: orders,
        };
    }

    async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        order.paymentStatus = paymentStatus;
        await this.orderRepository.save(order);

        return {
            success: true,
            message: 'Payment status updated',
            data: order,
        };
    }

    async findAll(query: any) {
        const { status, paymentStatus } = query;
        const where: any = {};
        if (status) where.orderStatus = status;
        if (paymentStatus) where.paymentStatus = paymentStatus;

        const orders = await this.orderRepository.find({
            where,
            order: { createdAt: 'DESC' },
        });

        return {
            success: true,
            data: orders,
        };
    }

    async updateOrder(id: string, updateData: any) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const oldStatus = order.orderStatus;
        Object.assign(order, updateData);
        const savedOrder = await this.orderRepository.save(order);

        if (updateData.orderStatus === 'Confirmed' && oldStatus !== 'Confirmed' && order.customer?.email) {
            await this.mailService.sendEmail({
                email: order.customer.email,
                subject: `Order Confirmed - ${order.id.slice(-8)}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
              <h2 style="color: #333; text-align: center;">Order Confirmed!</h2>
              <p>Dear ${order.customer.name},</p>
              <p>We are happy to inform you that your order <strong>#${order.id.slice(-8)}</strong> has been confirmed by our team.</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Order Summary</h3>
                  <p><strong>Total Amount:</strong> ₹${parseFloat(order.totalAmount.toString()).toLocaleString()}</p>
                  <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              </div>
              <p>We will notify you once your order is shipped.</p>
              <p>Thank you for shopping with us!</p>
          </div>
        `,
            });
        }

        return {
            success: true,
            message: 'Order updated successfully',
            data: savedOrder,
        };
    }
}

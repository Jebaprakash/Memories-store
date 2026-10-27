import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, PaymentStatus, OrderStatus, PaymentMethod } from '../../shared/entities/order.entity';
import { Product } from '../../shared/entities/product.entity';
import { MailService } from '../../shared/services/mail.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        private mailService: MailService,
        private productsService: ProductsService,
    ) { }

    async create(orderData: any) {
        if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            throw new BadRequestException('Order must contain at least one item');
        }

        // Validate customer
        if (!orderData.customer || typeof orderData.customer !== 'object') {
            throw new BadRequestException('Customer information is required');
        }
        const { name, email, phone, address, city, pincode } = orderData.customer;
        if (!name || typeof name !== 'string' || !name.trim()) {
            throw new BadRequestException('Customer name is required');
        }
        if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            throw new BadRequestException('A valid email address is required');
        }
        if (!phone || typeof phone !== 'string' || phone.trim().length < 10) {
            throw new BadRequestException('A valid phone number (at least 10 digits) is required');
        }
        if (!address || typeof address !== 'string' || !address.trim()) {
            throw new BadRequestException('Shipping address is required');
        }
        if (!city || typeof city !== 'string' || !city.trim()) {
            throw new BadRequestException('City is required');
        }
        if (!pincode || typeof pincode !== 'string' || pincode.trim().length !== 6) {
            throw new BadRequestException('A valid 6-digit pincode is required');
        }

        // Validate payment method
        const validPaymentMethods = [PaymentMethod.COD, PaymentMethod.QR, PaymentMethod.RAZORPAY];
        if (!validPaymentMethods.includes(orderData.paymentMethod)) {
            throw new BadRequestException('Invalid payment method');
        }

        const productRepo = this.orderRepository.manager.getRepository(Product);
        const validatedItems: any[] = [];
        let calculatedSubtotal = 0;

        // Authoritative stock and price validation from server database
        for (const item of orderData.items) {
            const id = item.id || item.productId;
            const quantity = parseInt(item.quantity || item.qty, 10);

            if (!id || isNaN(quantity) || quantity <= 0) {
                throw new BadRequestException('Invalid item format or quantity');
            }

            const product = await productRepo.findOne({ where: { id } });
            if (!product || !product.isActive) {
                throw new NotFoundException(`Product ${item.name || id} is not available`);
            }

            if (product.stockQty < quantity) {
                throw new BadRequestException(`Only ${product.stockQty} unit(s) of ${product.name} are available in stock`);
            }

            const authoritativePrice = parseFloat(product.price.toString());
            const itemTotal = authoritativePrice * quantity;
            calculatedSubtotal += itemTotal;

            validatedItems.push({
                id: product.id,
                productId: product.id,
                name: product.name,
                price: authoritativePrice,
                quantity,
                category: product.category,
                image: (product.images && product.images[0]) || product.image_url || null,
            });
        }

        // Reduce stock after all validation succeeds
        for (const item of validatedItems) {
            await this.productsService.updateStock(item.id, item.quantity);
        }

        const deliveryCharge = 50;
        const authoritativeTotal = Math.round((calculatedSubtotal + deliveryCharge) * 100) / 100;

        // Override client data with authoritative values
        orderData.items = validatedItems;
        orderData.totalAmount = authoritativeTotal;

        if (orderData.paymentMethod === PaymentMethod.QR) {
            orderData.orderStatus = OrderStatus.PaymentSubmitted;
            orderData.paymentStatus = PaymentStatus.PendingVerification;
        } else {
            orderData.orderStatus = OrderStatus.Pending;
            orderData.paymentStatus = PaymentStatus.Unpaid;
        }

        const order = this.orderRepository.create(orderData);
        const savedOrder = await this.orderRepository.save(order);
        return {
            success: true,
            message: 'Order created successfully and stock updated',
            data: savedOrder,
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

        const qb = this.orderRepository.createQueryBuilder('ord');

        if (email && phone) {
            qb.where("(LOWER(ord.customer->>'email') = LOWER(:email) OR ord.customer->>'phone' = :phone)", { email, phone });
        } else if (email) {
            qb.where("LOWER(ord.customer->>'email') = LOWER(:email)", { email });
        } else {
            qb.where("ord.customer->>'phone' = :phone", { phone });
        }

        qb.orderBy('ord.createdAt', 'DESC');
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

    async deleteOrder(id: string) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        await this.orderRepository.remove(order);
        return {
            success: true,
            message: 'Order deleted successfully',
        };
    }

    async deleteAllOrders() {
        await this.orderRepository.clear(); // Or use query builder to delete all
        return {
            success: true,
            message: 'All order history deleted successfully',
        };
    }
}

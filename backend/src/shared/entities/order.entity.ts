import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PaymentMethod {
    COD = 'COD',
    QR = 'QR',
    RAZORPAY = 'RAZORPAY',
}

export enum PaymentStatus {
    Unpaid = 'Unpaid',
    PendingVerification = 'PendingVerification',
    Paid = 'Paid',
}

export enum OrderStatus {
    Pending = 'Pending',
    Confirmed = 'Confirmed',
    Shipped = 'Shipped',
    Delivered = 'Delivered',
    Cancelled = 'Cancelled',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('jsonb')
    items: any;

    @Column('jsonb')
    customer: any;

    @Column('decimal', { precision: 10, scale: 2 })
    totalAmount: number;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
    })
    paymentMethod: PaymentMethod;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.Unpaid,
    })
    @Index()
    paymentStatus: PaymentStatus;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.Pending,
    })
    @Index()
    orderStatus: OrderStatus;

    @CreateDateColumn()
    @Index()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

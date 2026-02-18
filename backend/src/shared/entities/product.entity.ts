import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 200 })
    name: string;

    @Column('text')
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column()
    @Index()
    category: string;

    @Column('simple-array')
    images: string[];

    @Column({ default: 0 })
    stockQty: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    @Index()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

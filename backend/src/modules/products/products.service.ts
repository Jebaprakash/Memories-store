import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, LessThanOrEqual, MoreThanOrEqual, ILike } from 'typeorm';
import { Product } from '../../shared/entities/product.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async findAll(query: any) {
        const { search, category, minPrice, maxPrice, sort } = query;

        const where: any = { isActive: true };

        if (search) {
            where.name = ILike(`%${search}%`);
        }

        if (category) {
            where.category = category;
        }

        if (minPrice && maxPrice) {
            where.price = Between(parseFloat(minPrice), parseFloat(maxPrice));
        } else if (minPrice) {
            where.price = MoreThanOrEqual(parseFloat(minPrice));
        } else if (maxPrice) {
            where.price = LessThanOrEqual(parseFloat(maxPrice));
        }

        let order: any = { createdAt: 'DESC' };
        if (sort === 'price-low') {
            order = { price: 'ASC' };
        } else if (sort === 'price-high') {
            order = { price: 'DESC' };
        } else if (sort === 'newest') {
            order = { createdAt: 'DESC' };
        }

        const products = await this.productRepository.find({
            where,
            order,
        });

        return {
            success: true,
            count: products.length,
            data: products,
        };
    }

    async findAllAdmin() {
        const products = await this.productRepository.find({
            order: { createdAt: 'DESC' },
        });

        return {
            success: true,
            count: products.length,
            data: products,
        };
    }

    async findOne(id: string) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return {
            success: true,
            data: product,
        };
    }

    async create(productData: any) {
        const product = this.productRepository.create(productData);
        const savedProduct = await this.productRepository.save(product);
        return {
            success: true,
            message: 'Product created successfully',
            data: savedProduct,
        };
    }

    async update(id: string, updateData: any) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        Object.assign(product, updateData);
        const savedProduct = await this.productRepository.save(product);

        return {
            success: true,
            message: 'Product updated successfully',
            data: savedProduct,
        };
    }

    async delete(id: string) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Delete images (only local ones)
        if (product.images && product.images.length > 0) {
            product.images.forEach((imagePath) => {
                if (!imagePath.startsWith('http')) {
                    const fullPath = path.join(process.cwd(), imagePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
            });
        }

        await this.productRepository.remove(product);

        return {
            success: true,
            message: 'Product deleted successfully',
        };
    }

    async getCategories() {
        const products = await this.productRepository
            .createQueryBuilder('product')
            .select('DISTINCT(product.category)', 'category')
            .where('product.isActive = :isActive', { isActive: true })
            .getRawMany();

        const categories = products.map((p) => p.category);

        return {
            success: true,
            data: categories,
        };
    }

    async updateStock(id: string, quantity: number) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        product.stockQty -= quantity;
        if (product.stockQty < 0) product.stockQty = 0;
        
        // We keep isActive=true so it still shows "Out of Stock" in the frontend
        // if the user wants it hidden they can do it manually, but for now 
        // reaching 0 stock just makes it out of stock.
        
        await this.productRepository.save(product);

        return {
            success: true,
            message: 'Stock updated successfully',
        };
    }

    async checkStock(id: string, quantity: number) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (product.stockQty < quantity) {
            return {
                success: false,
                message: `Not enough stock for ${product.name}`,
                available: product.stockQty,
            };
        }

        return {
            success: true,
            available: product.stockQty,
        };
    }
}

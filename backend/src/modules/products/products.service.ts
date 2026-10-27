import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
        const { search, category, minPrice, maxPrice, sort, inStock } = query;

        const qb = this.productRepository.createQueryBuilder('product')
            .where('product.isActive = :isActive', { isActive: true });

        if (search && search.trim()) {
            const term = `%${search.trim()}%`;
            qb.andWhere(
                '(product.name ILIKE :term OR product.description ILIKE :term OR product.category ILIKE :term)',
                { term },
            );
        }

        if (category && category.trim()) {
            qb.andWhere('product.category = :category', { category: category.trim() });
        }

        if (minPrice !== undefined && minPrice !== '' && !isNaN(parseFloat(minPrice))) {
            qb.andWhere('product.price >= :minPrice', { minPrice: parseFloat(minPrice) });
        }

        if (maxPrice !== undefined && maxPrice !== '' && !isNaN(parseFloat(maxPrice))) {
            qb.andWhere('product.price <= :maxPrice', { maxPrice: parseFloat(maxPrice) });
        }

        if (inStock === 'true' || inStock === true || inStock === '1') {
            qb.andWhere('product.stockQty > 0');
        }

        if (sort === 'price-low') {
            qb.orderBy('product.price', 'ASC');
        } else if (sort === 'price-high') {
            qb.orderBy('product.price', 'DESC');
        } else {
            qb.orderBy('product.createdAt', 'DESC');
        }

        const products = await qb.getMany();

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
        if (!id) {
            throw new BadRequestException('Product ID is required');
        }
        
        if (isNaN(quantity)) {
            throw new BadRequestException('Invalid quantity provided');
        }

        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
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
        if (!id) {
            throw new BadRequestException('Product ID is required');
        }

        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
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

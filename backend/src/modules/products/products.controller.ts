import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('api/products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all active products' })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'category', required: false })
    @ApiQuery({ name: 'minPrice', required: false, type: Number })
    @ApiQuery({ name: 'maxPrice', required: false, type: Number })
    @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'price-low', 'price-high'] })
    @ApiResponse({ status: 200, description: 'List of products' })
    async getProducts(@Query() query: any) {
        return this.productsService.findAll(query);
    }

    @Get('categories')
    @ApiOperation({ summary: 'Get all product categories' })
    @ApiResponse({ status: 200, description: 'List of categories' })
    async getCategories() {
        return this.productsService.getCategories();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID' })
    @ApiResponse({ status: 200, description: 'Product details' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async getProductById(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }
}

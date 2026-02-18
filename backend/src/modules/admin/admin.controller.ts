import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Admin')
@Controller('api/admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly productsService: ProductsService,
        private readonly ordersService: OrdersService,
    ) { }

    @Post('login')
    @ApiOperation({ summary: 'Admin login' })
    async login(@Body() body: any) {
        return this.adminService.login(body.username, body.password);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('products')
    @ApiOperation({ summary: 'Get all products (including inactive)' })
    async getAllProducts() {
        return this.productsService.findAllAdmin();
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('products')
    @ApiOperation({ summary: 'Create a new product' })
    @UseInterceptors(
        FilesInterceptor('images', 5, {
            storage: diskStorage({
                destination: './uploads/products',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    return cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    async createProduct(@Body() productData: any, @UploadedFiles() files: Array<Express.Multer.File>) {
        const images = files ? files.map((file) => `/uploads/products/${file.filename}`) : [];
        return this.productsService.create({
            ...productData,
            images,
            price: parseFloat(productData.price),
            stockQty: parseInt(productData.stockQty, 10),
            isActive: productData.isActive === 'true' || productData.isActive === true,
        });
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Put('products/:id')
    @ApiOperation({ summary: 'Update a product' })
    @UseInterceptors(
        FilesInterceptor('images', 5, {
            storage: diskStorage({
                destination: './uploads/products',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    return cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    async updateProduct(
        @Param('id') id: string,
        @Body() productData: any,
        @UploadedFiles() files: Array<Express.Multer.File>,
    ) {
        const updateData: any = { ...productData };
        if (files && files.length > 0) {
            updateData.images = files.map((file) => `/uploads/products/${file.filename}`);
        }
        if (productData.price) updateData.price = parseFloat(productData.price);
        if (productData.stockQty) updateData.stockQty = parseInt(productData.stockQty, 10);
        if (productData.isActive !== undefined) {
            updateData.isActive = productData.isActive === 'true' || productData.isActive === true;
        }

        return this.productsService.update(id, updateData);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete('products/:id')
    @ApiOperation({ summary: 'Delete a product' })
    async deleteProduct(@Param('id') id: string) {
        return this.productsService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('orders')
    @ApiOperation({ summary: 'Get all orders' })
    async getAllOrders(@Query() query: any) {
        return this.ordersService.findAll(query);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch('orders/:id')
    @ApiOperation({ summary: 'Update order status' })
    async updateOrder(@Param('id') id: string, @Body() updateData: any) {
        return this.ordersService.updateOrder(id, updateData);
    }
}

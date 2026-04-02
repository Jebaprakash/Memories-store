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
    UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly productsService: ProductsService,
        private readonly ordersService: OrdersService,
        private readonly cloudinaryService: CloudinaryService,
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
        FileInterceptor('image', {
            storage: memoryStorage(),
        }),
    )
    async createProduct(@Body() productData: any, @UploadedFile() file: any) {
        let imageUrl = '';
        if (file) {
            imageUrl = await this.cloudinaryService.uploadImage(file);
        }

        return this.productsService.create({
            ...productData,
            image_url: imageUrl,
            images: imageUrl ? [imageUrl] : [],
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
        FileInterceptor('image', {
            storage: memoryStorage(),
        }),
    )
    async updateProduct(
        @Param('id') id: string,
        @Body() productData: any,
        @UploadedFile() file: any,
    ) {
        let imageUrl = productData.image_url;

        if (file) {
            imageUrl = await this.cloudinaryService.uploadImage(file);
        }

        const updateData: any = { ...productData };
        if (imageUrl) {
            updateData.image_url = imageUrl;
            updateData.images = [imageUrl];
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
        const productResponse = await this.productsService.findOne(id);
        const product = productResponse.data;
        if (product && product.image_url) {
            await this.cloudinaryService.deleteImage(product.image_url);
        } else if (product && product.images && product.images.length > 0) {
            await this.cloudinaryService.deleteImage(product.images[0]);
        }
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

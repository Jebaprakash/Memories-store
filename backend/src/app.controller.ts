import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('General')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'API Root' })
  getHello() {
    return {
      success: true,
      message: 'E-commerce API',
      version: '1.0.0',
      documentation: '/api-docs',
      database: 'PostgreSQL',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health Check' })
  getHealth() {
    return {
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    };
  }
}

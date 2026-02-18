import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Put('profile')
    @ApiOperation({ summary: 'Update user profile' })
    async updateProfile(@Request() req: any, @Body() updateData: any) {
        return this.usersService.update(req.user.id, updateData);
    }
}

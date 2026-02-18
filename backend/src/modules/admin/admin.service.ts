import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Admin } from '../../shared/entities/admin.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
        private jwtService: JwtService,
    ) { }

    async login(username: string, pass: string) {
        const admin = await this.adminRepository.findOne({ where: { username } });
        if (admin && (await bcrypt.compare(pass, admin.password))) {
            const payload = { username: admin.username, id: admin.id, role: 'admin' };
            return {
                success: true,
                accessToken: this.jwtService.sign(payload),
                admin: {
                    id: admin.id,
                    username: admin.username,
                },
            };
        }
        throw new UnauthorizedException('Invalid credentials');
    }
}

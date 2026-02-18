import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../shared/entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async create(userData: any): Promise<User> {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        const user = this.usersRepository.create({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: hashedPassword,
            phone: userData.phone,
            address: userData.address || {},
        });
        return this.usersRepository.save(user);
    }

    async update(id: string, updateData: any): Promise<User | null> {
        await this.usersRepository.update(id, updateData);
        return this.findOneById(id);
    }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    private googleClient: OAuth2Client;

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {
        this.googleClient = new OAuth2Client(
            this.configService.get<string>('GOOGLE_CLIENT_ID'),
        );
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, id: user.id, role: 'user' };
        return {
            success: true,
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                address: user.address,
            },
        };
    }

    async register(userData: any) {
        const existingUser = await this.usersService.findOneByEmail(userData.email);
        if (existingUser) {
            return { success: false, message: 'User already exists' };
        }
        const user = await this.usersService.create(userData);
        return this.login(user);
    }

    async googleLogin(accessToken: string) {
        try {
            // Fetch user info from Google using the access token
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!response.ok) {
                return { success: false, message: 'Invalid Google token' };
            }

            const payload = await response.json();
            const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;

            if (!googleId || !email) {
                return { success: false, message: 'Could not retrieve Google account info' };
            }

            const user = await this.usersService.findOrCreateGoogleUser({
                googleId,
                email,
                firstName: firstName || '',
                lastName: lastName || '',
            });

            return this.login(user);
        } catch (error) {
            console.error('Google login error:', error);
            return { success: false, message: 'Google authentication failed' };
        }
    }
}

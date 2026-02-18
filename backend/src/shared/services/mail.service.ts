import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        const host = this.configService.get<string>('EMAIL_HOST');
        const user = this.configService.get<string>('EMAIL_USER');
        const pass = this.configService.get<string>('EMAIL_PASS');

        if (!host || !user || !pass || user === 'your-email@gmail.com' || pass === 'your-app-password') {
            this.logger.warn('Email configuration missing or contains placeholders. Skipping email sending setup.');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host,
            port: this.configService.get<number>('EMAIL_PORT') || 587,
            secure: this.configService.get<string>('EMAIL_SECURE') === 'true',
            auth: {
                user,
                pass,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }

    async sendEmail(options: { email: string; subject: string; message?: string; html?: string }) {
        if (!this.transporter) {
            this.logger.warn('Email transporter not initialized. Skipping email send.');
            return;
        }

        const businessName = this.configService.get<string>('BUSINESS_NAME') || 'Ecommerce Store';
        const user = this.configService.get<string>('EMAIL_USER');

        const mailOptions = {
            from: `"${businessName}" <${user}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        try {
            this.logger.log(`Attempting to send email to ${options.email}...`);
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent successfully: ${info.messageId}`);
            return info;
        } catch (error) {
            this.logger.error(`ERROR SENDING EMAIL: ${error.message}`);
        }
    }
}

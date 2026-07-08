import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(config: ConfigService) {
    this.resend = new Resend(config.getOrThrow<string>('RESEND_API_KEY'));
    this.fromEmail = config.getOrThrow<string>('RESEND_FROM_EMAIL');
  }

  async sendVerificationEmail(to: string, name: string, link: string) {
    await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: 'Verify your Collabrix email',
      html: `
        <p>Hi ${name},</p>
        <p>Welcome to Collabrix! Please verify your email address to activate your account.</p>
        <p><a href="${link}">Verify email</a></p>
        <p>This link expires in 24 hours.</p>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, name: string, link: string) {
    await this.resend.emails.send({
      from: this.fromEmail,
      to,
      subject: 'Reset your Collabrix password',
      html: `
        <p>Hi ${name},</p>
        <p>We received a request to reset your Collabrix password.</p>
        <p><a href="${link}">Reset password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
      `,
    });
  }
}

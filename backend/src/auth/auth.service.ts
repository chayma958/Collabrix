import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { AuthTokenType, type User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { GoogleProfile } from './strategies/google.strategy';

const SALT_ROUNDS = 10;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class AuthService {
  private frontendUrl: string;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private email: EmailService,
    config: ConfigService,
  ) {
    this.frontendUrl = config.get<string>(
      'CORS_ORIGIN',
      'http://localhost:5173',
    );
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    await this.dispatchVerificationEmail(user);

    return {
      message:
        'Registered successfully. Please check your email to verify your account.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.emailVerified) {
      throw new ForbiddenException({
        message: 'Please verify your email before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account uses Google sign-in. Please continue with Google.',
      );
    }
    if (!(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async handleGoogleLogin(profile: GoogleProfile) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (!user) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });
      user = existingByEmail
        ? await this.prisma.user.update({
            where: { id: existingByEmail.id },
            data: { googleId: profile.googleId, emailVerified: true },
          })
        : await this.prisma.user.create({
            data: {
              email: profile.email,
              googleId: profile.googleId,
              firstName: profile.firstName,
              lastName: profile.lastName,
              avatarUrl: profile.avatarUrl,
              emailVerified: true,
            },
          });
    }

    return this.buildAuthResponse(user);
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const authToken = await this.consumeToken(
      dto.token,
      AuthTokenType.EMAIL_VERIFICATION,
    );
    const user = await this.prisma.user.update({
      where: { id: authToken.userId },
      data: { emailVerified: true },
    });
    return this.buildAuthResponse(user);
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user && !user.emailVerified) {
      await this.dispatchVerificationEmail(user);
    }
    return {
      message:
        'If an account with that email exists and is unverified, a new verification email has been sent.',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user) {
      const rawToken = await this.issueToken(
        user.id,
        AuthTokenType.PASSWORD_RESET,
        PASSWORD_RESET_TTL_MS,
      );
      const link = `${this.frontendUrl}/reset-password?token=${rawToken}`;
      await this.email.sendPasswordResetEmail(user.email, user.firstName, link);
    }
    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const authToken = await this.consumeToken(
      dto.token,
      AuthTokenType.PASSWORD_RESET,
    );
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.update({
      where: { id: authToken.userId },
      data: { passwordHash },
    });
    return this.buildAuthResponse(user);
  }

  private async dispatchVerificationEmail(user: User) {
    const rawToken = await this.issueToken(
      user.id,
      AuthTokenType.EMAIL_VERIFICATION,
      EMAIL_VERIFICATION_TTL_MS,
    );
    const link = `${this.frontendUrl}/verify-email?token=${rawToken}`;
    await this.email.sendVerificationEmail(user.email, user.firstName, link);
  }

  private async issueToken(
    userId: string,
    type: AuthTokenType,
    ttlMs: number,
  ): Promise<string> {
    const rawToken = randomBytes(32).toString('hex');
    await this.prisma.authToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(rawToken),
        type,
        expiresAt: new Date(Date.now() + ttlMs),
      },
    });
    return rawToken;
  }

  private async consumeToken(rawToken: string, type: AuthTokenType) {
    const authToken = await this.prisma.authToken.findUnique({
      where: { tokenHash: this.hashToken(rawToken) },
    });
    if (
      !authToken ||
      authToken.type !== type ||
      authToken.usedAt ||
      authToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    await this.prisma.authToken.update({
      where: { id: authToken.id },
      data: { usedAt: new Date() },
    });
    return authToken;
  }

  private hashToken(rawToken: string) {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private buildAuthResponse(user: User) {
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}

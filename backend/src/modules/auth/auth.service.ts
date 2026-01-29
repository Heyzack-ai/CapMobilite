import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { PrismaService } from '@/database/prisma.service';
import {
  hashPassword,
  comparePassword,
  generateRandomCode,
  generateSecureToken,
  generateUUID,
} from '@common/utils';
import { UserRole, UserStatus, ConsentType } from '@common/enums';
import {
  RegisterDto,
  LoginDto,
  LoginResponseDto,
  VerifyEmailDto,
  VerifyMfaDto,
  RequestPasswordResetDto,
  ConfirmPasswordResetDto,
  RefreshTokenDto,
  TokenResponseDto,
  MfaSetupResponseDto,
} from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ userId: string; message: string }> {
    // Validate consents
    if (!dto.acceptTerms || !dto.acceptHealthDataConsent) {
      throw new BadRequestException('Terms and health data consent are required');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email.toLowerCase() },
          ...(dto.phone ? [{ phone: dto.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(dto.password);

    // Generate verification code
    const verificationCode = generateRandomCode(6);
    const codeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user and patient profile in transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          phone: dto.phone || null,
          passwordHash,
          role: UserRole.PATIENT,
          status: UserStatus.PENDING_VERIFICATION,
        },
      });

      // Create patient profile
      await tx.patientProfile.create({
        data: {
          userId: newUser.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          dateOfBirth: new Date(dto.dateOfBirth),
        },
      });

      // Store verification code
      await tx.verificationCode.create({
        data: {
          userId: newUser.id,
          code: verificationCode,
          type: 'EMAIL_VERIFICATION',
          expiresAt: codeExpiry,
        },
      });

      // Record consents
      await tx.consent.createMany({
        data: [
          {
            patientId: (await tx.patientProfile.findUnique({ where: { userId: newUser.id } })).id,
            consentType: ConsentType.TERMS_OF_SERVICE,
            version: '1.0.0',
            textHash: 'placeholder-hash', // In production, use actual hash
            ipAddress: '0.0.0.0', // Should be passed from controller
            userAgent: 'unknown', // Should be passed from controller
          },
          {
            patientId: (await tx.patientProfile.findUnique({ where: { userId: newUser.id } })).id,
            consentType: ConsentType.HEALTH_DATA,
            version: '1.0.0',
            textHash: 'placeholder-hash',
            ipAddress: '0.0.0.0',
            userAgent: 'unknown',
          },
        ],
      });

      return newUser;
    });

    // TODO: Send verification email via notification service
    this.logger.log(`Verification code for ${dto.email}: ${verificationCode}`);

    return {
      userId: user.id,
      message: 'Registration successful. Please verify your email.',
    };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or verification code');
    }

    const verificationRecord = await this.prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code: dto.code,
        type: 'EMAIL_VERIFICATION',
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationRecord) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          status: UserStatus.ACTIVE,
        },
      }),
      this.prisma.verificationCode.update({
        where: { id: verificationRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === UserStatus.PENDING_VERIFICATION) {
      throw new UnauthorizedException('Please verify your email first');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Check if MFA is enabled
    if (user.mfaEnabled && user.mfaSecret) {
      // Generate MFA challenge token
      const mfaToken = this.jwtService.sign(
        { sub: user.id, type: 'mfa_challenge' },
        {
          secret: this.configService.get<string>('jwt.secret'),
          expiresIn: '5m',
        },
      );

      return {
        mfaRequired: true,
        mfaToken,
      };
    }

    // Generate tokens
    return this.generateTokens(user);
  }

  async verifyMfa(dto: VerifyMfaDto): Promise<TokenResponseDto> {
    // Verify MFA token
    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify(dto.mfaToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired MFA token');
    }

    if (payload.type !== 'mfa_challenge') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('User not found or MFA not enabled');
    }

    // Verify TOTP code
    const isValid = authenticator.verify({
      token: dto.code,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    return this.generateTokens(user);
  }

  async refreshToken(dto: RefreshTokenDto): Promise<TokenResponseDto> {
    // Verify refresh token
    let payload: { sub: string; jti: string };
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Check token in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    return this.generateTokens(storedToken.user);
  }

  async logout(userId: string, refreshToken?: string): Promise<{ message: string }> {
    if (refreshToken) {
      // Revoke specific token
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          token: refreshToken,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    } else {
      // Revoke all tokens for user
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    return { message: 'Logged out successfully' };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Always return success message to prevent email enumeration
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = generateSecureToken(32);
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.verificationCode.create({
      data: {
        userId: user.id,
        code: resetToken,
        type: 'PASSWORD_RESET',
        expiresAt: tokenExpiry,
      },
    });

    // TODO: Send reset email via notification service
    this.logger.log(`Password reset token for ${dto.email}: ${resetToken}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async confirmPasswordReset(dto: ConfirmPasswordResetDto): Promise<{ message: string }> {
    const verificationRecord = await this.prisma.verificationCode.findFirst({
      where: {
        code: dto.token,
        type: 'PASSWORD_RESET',
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationRecord) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await hashPassword(dto.newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationRecord.userId },
        data: { passwordHash },
      }),
      this.prisma.verificationCode.update({
        where: { id: verificationRecord.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all refresh tokens on password change
      this.prisma.refreshToken.updateMany({
        where: { userId: verificationRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  async setupMfa(userId: string): Promise<MfaSetupResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.mfaEnabled) {
      throw new BadRequestException('MFA is already enabled');
    }

    // Generate TOTP secret
    const secret = authenticator.generateSecret();

    // Generate QR code URL
    const otpauth = authenticator.keyuri(
      user.email,
      'AX TECH Wheelchair',
      secret,
    );

    // Store secret temporarily (will be confirmed when user enables MFA)
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });

    return {
      secret,
      qrCodeUrl: otpauth,
    };
  }

  async enableMfa(userId: string, code: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.mfaSecret) {
      throw new BadRequestException('MFA setup not initiated');
    }

    if (user.mfaEnabled) {
      throw new BadRequestException('MFA is already enabled');
    }

    // Verify TOTP code
    const isValid = authenticator.verify({
      token: code,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid MFA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    return { message: 'MFA enabled successfully' };
  }

  async disableMfa(userId: string, code: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.mfaEnabled) {
      throw new BadRequestException('MFA is not enabled');
    }

    // Verify TOTP code
    const isValid = authenticator.verify({
      token: code,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid MFA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
      },
    });

    return { message: 'MFA disabled successfully' };
  }

  private async generateTokens(user: any): Promise<TokenResponseDto & { mfaRequired: boolean }> {
    const jti = generateUUID();
    const accessExpiration = this.configService.get<string>('jwt.accessExpiration', '15m');
    const refreshExpiration = this.configService.get<string>('jwt.refreshExpiration', '7d');

    // Get user permissions based on role
    const permissions = this.getRolePermissions(user.role);

    // Generate access token
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        permissions,
        jti,
      },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: accessExpiration,
      },
    );

    // Generate refresh token
    const refreshJti = generateUUID();
    const refreshToken = this.jwtService.sign(
      { sub: user.id, jti: refreshJti },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: refreshExpiration,
      },
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      mfaRequired: false,
      accessToken,
      refreshToken,
      expiresIn: this.parseExpirationToSeconds(accessExpiration),
    };
  }

  private getRolePermissions(role: UserRole): string[] {
    const permissionMap: Record<UserRole, string[]> = {
      [UserRole.PATIENT]: [
        'case:create:own',
        'case:read:own',
        'case:update:limited',
        'document:upload:own',
        'document:read:own',
        'quote:approve:own',
        'device:read:own',
        'ticket:create:own',
      ],
      [UserRole.PRESCRIBER]: [
        'prescription:upload',
        'case:read:related',
        'document:upload:own',
        'document:read:related',
      ],
      [UserRole.OPS]: [
        'case:create',
        'case:read:all',
        'case:update:all',
        'document:upload:all',
        'document:read:all',
        'quote:create',
        'claim:read',
        'device:read:all',
        'ticket:create',
        'ticket:assign',
      ],
      [UserRole.BILLING]: [
        'case:read:all',
        'case:update:limited',
        'document:read:all',
        'claim:submit',
        'claim:read:all',
      ],
      [UserRole.TECHNICIAN]: [
        'case:read:assigned',
        'device:read:assigned',
        'ticket:create',
        'ticket:update:assigned',
        'document:upload:own',
      ],
      [UserRole.COMPLIANCE_ADMIN]: [
        'case:read:all',
        'document:read:all',
        'claim:read:all',
        'device:read:all',
        'audit:read:all',
      ],
    };

    return permissionMap[role] || [];
  }

  private parseExpirationToSeconds(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 900;
    }
  }
}

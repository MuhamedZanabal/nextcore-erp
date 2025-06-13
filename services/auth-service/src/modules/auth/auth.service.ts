import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Role } from '../roles/entities/role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenDto } from './dto/token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<TokenDto> {
    const { email, password } = loginDto;
    
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto): Promise<TokenDto> {
    const { email, password, firstName, lastName, tenantName } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create tenant
    const tenantSlug = tenantName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const existingTenant = await this.tenantsRepository.findOne({
      where: [{ name: tenantName }, { slug: tenantSlug }],
    });

    if (existingTenant) {
      throw new ConflictException('Tenant with this name already exists');
    }

    const tenant = this.tenantsRepository.create({
      name: tenantName,
      slug: tenantSlug,
    });

    await this.tenantsRepository.save(tenant);

    // Create admin role for the tenant
    const adminRole = this.rolesRepository.create({
      name: 'Admin',
      description: 'Administrator role with full access',
      permissions: ['*'],
      isSystemRole: true,
      tenantId: tenant.id,
    });

    await this.rolesRepository.save(adminRole);

    // Create user
    const user = this.usersRepository.create({
      firstName,
      lastName,
      email,
      password,
      tenantId: tenant.id,
      isEmailVerified: false,
      roles: [adminRole],
    });

    await this.usersRepository.save(user);

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string): Promise<TokenDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
        relations: ['roles'],
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private generateTokens(user: User): TokenDto {
    const roles = user.roles.map(role => role.name);
    
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        roles,
      },
    };
  }
}
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
        const decoded = jwt.verify(token, secret) as any;
        
        if (decoded && decoded.tenantId) {
          req['tenantId'] = decoded.tenantId;
        }
      } catch (error) {
        // Token verification failed, but we'll let the auth guard handle that
      }
    }
    
    next();
  }
}
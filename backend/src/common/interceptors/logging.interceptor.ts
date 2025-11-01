import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body } = request;
    const now = Date.now();

    const message = `${method} ${url}`;
    const logContext = {
      method,
      url,
      user: user?.email || 'anonymous',
      empresaId: user?.empresaId || 'none',
      role: user?.role || 'none',
    };

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;

          this.logger.log(
            {
              ...logContext,
              statusCode: response.statusCode,
              delay: `${delay}ms`,
              body: method !== 'GET' && body ? this.sanitizeBody(body) : undefined,
            },
            message,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;

          this.logger.error(
            {
              ...logContext,
              error: error.message,
              delay: `${delay}ms`,
              statusCode: error.status || 500,
              stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
            message,
          );
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    
    // Remover campos sensíveis
    if (sanitized.senha) sanitized.senha = '***';
    if (sanitized.password) sanitized.password = '***';
    if (sanitized.token) sanitized.token = '***';
    
    return sanitized;
  }
}

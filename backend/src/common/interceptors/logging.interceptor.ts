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

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;

          this.logger.log(
            {
              method,
              url,
              statusCode: response.statusCode,
              delay: `${delay}ms`,
              user: user?.email || 'anonymous',
              body: method !== 'GET' ? body : undefined,
            },
            message,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;

          this.logger.error(
            {
              method,
              url,
              error: error.message,
              delay: `${delay}ms`,
              user: user?.email || 'anonymous',
              stack: error.stack,
            },
            message,
          );
        },
      }),
    );
  }
}

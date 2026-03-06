import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { AppMensagem } from '../messages/message.types';

type GenericBody = Record<string, unknown>;

@Injectable()
export class ResponseMessagesInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const body = data as GenericBody;
          const mensagens = Array.isArray(body.mensagens)
            ? (body.mensagens as AppMensagem[])
            : [];

          return {
            ...body,
            mensagens,
          };
        }

        return {
          data,
          mensagens: [] as AppMensagem[],
        };
      }),
    );
  }
}

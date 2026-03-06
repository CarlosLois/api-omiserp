import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as { message?: string | string[] })?.message ??
          'Erro interno do servidor';

    const error =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'error' in exceptionResponse
        ? String((exceptionResponse as { error?: unknown }).error)
        : HttpStatus[status];

    const body = {
      statusCode: status,
      message,
      error,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      JSON.stringify({
        event: 'http_exception',
        ...body,
      }),
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(body);
  }
}

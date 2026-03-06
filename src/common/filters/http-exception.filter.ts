import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppMensagem, criarMensagem } from '../messages/message.types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  private obterMensagens(exceptionResponse: unknown): AppMensagem[] {
    if (typeof exceptionResponse === 'string') {
      return [criarMensagem(exceptionResponse)];
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'mensagens' in exceptionResponse &&
      Array.isArray((exceptionResponse as { mensagens?: unknown }).mensagens)
    ) {
      return (exceptionResponse as { mensagens: AppMensagem[] }).mensagens;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const rawMessage = (exceptionResponse as { message?: string | string[] })
        .message;
      if (Array.isArray(rawMessage)) {
        return rawMessage.map((mensagem) => criarMensagem(String(mensagem)));
      }
      if (typeof rawMessage === 'string') {
        return [criarMensagem(rawMessage)];
      }
    }

    return [
      criarMensagem(
        'Erro interno do servidor',
        'Tente novamente em instantes.',
      ),
    ];
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    const mensagens = this.obterMensagens(exceptionResponse);
    const message = mensagens[0]?.mensagem ?? 'Erro interno do servidor';

    const error =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'error' in exceptionResponse
        ? String((exceptionResponse as { error?: unknown }).error)
        : HttpStatus[status];

    const body = {
      statusCode: status,
      message,
      mensagens,
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

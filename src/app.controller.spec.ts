import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { CoreService } from './core/services/core.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: CoreService,
          useValue: {},
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return api health status', () => {
      const result = appController.health();

      expect(result.status).toBe('ok');
      expect(result.service).toBe('api-gestao');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });
});

import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AnalyticsService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

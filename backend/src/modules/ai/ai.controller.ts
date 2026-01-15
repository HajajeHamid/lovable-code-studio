import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('execute')
  async execute(@Body() body: { goal: string; userId: string }) {
    const { goal, userId } = body;
    return this.aiService.execute(goal, './project', userId);
  }
}

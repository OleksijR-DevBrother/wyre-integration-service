import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { AppService } from './app.service';
import { GetWidgetLinkDto } from './dto/get-widget-link.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('widget-link')
  @ApiOperation({ summary: 'Get Wyre widget URL' })
  async getWidgetLink(@Body() dto: GetWidgetLinkDto) {
    return {
      success: true,
      url: await this.appService.getWidgetUrl(dto),
    };
  }
}

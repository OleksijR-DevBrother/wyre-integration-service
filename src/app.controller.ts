import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { AppService } from './app.service';
import { GetWidgetLinkDto } from './dto/get-widget-link.dto';
import { WalletOrderUpdateDto } from './dto/wallet-order-callback.dto';

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

  @Post('wallet-order-callback')
  @ApiOperation({
    summary: 'Endpoint to receive Wyre wallet order webhook callbacks',
  })
  async walletOrderUpdate(@Body() dto: WalletOrderUpdateDto) {
    await this.appService.processWebhook(dto);
  }
}

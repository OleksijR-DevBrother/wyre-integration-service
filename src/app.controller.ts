import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { AppService } from './app.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { WalletOrderUpdateDto } from './dto/wallet-order-callback.dto';

@Controller('v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('deposit/create')
  @ApiOperation({ summary: 'Get Wyre widget URL' })
  async getWidgetLink(@Body() dto: CreateDepositDto) {
    await this.appService.createDeposit(dto);

    return {
      success: true,
    };
  }

  @Post('wallet-order-callback')
  @ApiOperation({
    summary: 'Endpoint to receive Wyre wallet order webhook callbacks',
  })
  async walletOrderUpdate(@Body() dto: WalletOrderUpdateDto) {
    await this.appService.processWebhook(dto);

    return {
      success: true,
    };
  }
}

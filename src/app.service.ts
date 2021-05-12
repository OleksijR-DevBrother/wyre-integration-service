import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as crypto from 'crypto-js';
import { Repository } from 'typeorm';

import { config } from './config';
import { GetWidgetLinkDto } from './dto/get-widget-link.dto';
import { WalletOrderUpdateDto } from './dto/wallet-order-callback.dto';
import { Webhook } from './models/webhook.entity';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private apiKey: string;

  constructor(
    @InjectRepository(Webhook) private webhookRepository: Repository<Webhook>,
  ) {}

  async onApplicationBootstrap() {
    const res = await axios.post(
      new URL('/v2/sessions/auth/key', config.api.url).toString(),
      {
        secretKey: config.api.secretKey,
      },
    );

    if (!res.data.authenticatedAs) {
      throw new Error("Can't get Wyre API key");
    } else {
      this.apiKey = res.data.apiKey;
    }
  }

  private sign(url: string, data: any = '') {
    data && (data = JSON.stringify(data));

    console.log(url + data);

    return crypto.enc.Hex.stringify(
      crypto.HmacSHA256(url + data, config.api.secretKey),
    );
  }

  destCurrencyToAddress = {
    btc: 'bitcoin',
    eth: 'ethereum',
  };
  async getWidgetUrl(dto: GetWidgetLinkDto) {
    const destinationPrefix = this.destCurrencyToAddress[
      dto.destinationCurrency.toLowerCase()
    ];
    if (!destinationPrefix) {
      throw new BadRequestException('Invalid destination currency');
    }

    const body = {
      referrerAccountId: config.api.referrerAccountId,
      destCurrency: dto.destinationCurrency,
      dest: destinationPrefix + ':' + dto.destination,
      // lockFields: ['dest', 'destCurrency'],
    };
    dto.sourceCurrency && (body['sourceCurrency'] = dto.sourceCurrency);

    const url = new URL(
      `/v3/orders/reserve?timestamp=${new Date().valueOf()}`,
      config.api.url,
    ).toString();
    const res = await axios.post(url, body, {
      headers: {
        'X-Api-Key': this.apiKey,
        'X-Api-Signature': this.sign(url, body),
      },
    });

    if (!res.data.url) {
      throw new InternalServerErrorException("Can't get widget URL");
    }

    const webhook = new Webhook(res.data.reservation, dto.callbackUrl);
    await this.webhookRepository.save(webhook);

    return res.data.url as string;
  }

  async processWebhook(dto: WalletOrderUpdateDto) {
    const webhook = await this.webhookRepository.findOne({
      reservation: dto.reservation,
    });

    const body = {
      orderStatus: dto.orderStatus,
    };
    dto.orderStatus === 'FAILED' && (body['message'] = dto.failedReason);
    await axios.post(webhook.url, body);

    console.log(webhook.url, body);
  }
}

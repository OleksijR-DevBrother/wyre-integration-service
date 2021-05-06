import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto-js';

import { config } from './config';
import { GetWidgetLinkDto } from './dto/get-widget-link.dto';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private apiKey: string;

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
      lockFields: ['dest', 'destCurrency'],
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

    const u = `https://api.testwyre.com/v3/orders/lll?timestamp=${new Date().valueOf()}`;
    console.log(
      (
        await axios.get(u, {
          headers: {
            'X-Api-Key': this.apiKey,
            'X-Api-Signature': this.sign(u),
          },
        })
      ).data,
    );

    return res.data.url as string;
  }
}

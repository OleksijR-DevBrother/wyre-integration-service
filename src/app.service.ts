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
import { CreateDepositDto } from './dto/create-deposit.dto';
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

    return crypto.enc.Hex.stringify(
      crypto.HmacSHA256(url + data, config.api.secretKey),
    );
  }

  destCurrencyToAddress = {
    btc: 'bitcoin',
    eth: 'ethereum',
  };
  async createDeposit(dto: CreateDepositDto) {
    if (await this.webhookRepository.findOne({ txid: dto.txid })) {
      throw new BadRequestException('TXID_ALREADY_EXIST');
    }

    const destinationPrefix = this.destCurrencyToAddress[
      dto.product.toLowerCase()
    ];
    if (!destinationPrefix) {
      throw new BadRequestException('PRODUCT_NOT_SUPPORTED');
    }

    const body = {
      referrerAccountId: config.api.referrerAccountId,
      destCurrency: dto.product,
      dest:
        destinationPrefix +
        ':' +
        config.destinationAddresses[dto.product.toLowerCase()],
      lockFields: ['dest', 'destCurrency'],
    };

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
      throw new InternalServerErrorException("CAN'T_GET_IFRAME_URL");
    }

    const webhook = new Webhook(
      dto.txid,
      res.data.reservation,
      dto.callback_url,
    );
    await this.webhookRepository.save(webhook);

    await axios.post(webhook.callback_url, {
      txid: webhook.txid,
      status: 'PENDING',
      iframe_url: res.data.url,
    });
  }

  async processWebhook(dto: WalletOrderUpdateDto) {
    const webhook = await this.webhookRepository.findOne({
      reservation: dto.reservation,
    });

    const body = {
      txid: webhook.txid,
      status: dto.orderStatus,
    };
    switch (dto.orderStatus) {
      case 'PROCESSING':
        return;
      case 'COMPLETE':
        const url = `https://api.testwyre.com/v3/orders/${
          dto.orderId
        }?timestamp=${new Date().valueOf()}`;
        const res = await axios.get(url, {
          headers: {
            'X-Api-Key': this.apiKey,
            'X-Api-Signature': this.sign(url),
          },
        });

        body.status = 'COMPLETED';
        body['amount'] = res.data.purchaseAmount;
        break;
      case 'FAILED':
        body['message'] = dto.failedReason;
        break;
    }
    await axios.post(webhook.callback_url, body);
  }
}

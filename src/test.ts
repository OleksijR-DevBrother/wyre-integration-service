import axios from 'axios';
import * as crypto from 'crypto-js';

import { config } from './config';

axios.defaults.validateStatus = () => true;

const sign = (url: string, data: any) =>
  crypto.enc.Hex.stringify(
    crypto.HmacSHA256(url + JSON.stringify(data), config.api.secretKey),
  );

async function main() {
  // const apiKey = (
  //   await axios.post(
  //     new URL('/v2/sessions/auth/key', config.apiUrl).toString(),
  //     {
  //       secretKey: config.apiSecret,
  //     },
  //   )
  // ).data.apiKey;
  const apiKey = 'AK-DFLBJ6W8-MRFF8Q2E-83NHGND3-VC8HG322';

  const url = new URL(
    `/v3/orders/reserve?timestamp=${new Date().valueOf()}`,
    config.api.url,
  ).toString();
  const body = {
    referrerAccountId: 'AC_7J72W7YDJHD',
    amount: 133,
    sourceCurrency: 'AUD',
    destCurrency: 'ETH',
    dest: 'ethereum:0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413',
    lockFields: ['destCurrency', 'dest'],
  };
  const res = await axios.post(url, body, {
    headers: {
      'X-Api-Key': apiKey,
      'X-Api-Signature': sign(url, body),
    },
  });

  console.log(res.status);
  console.log(res.data);
}

main();

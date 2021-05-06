import { config as fromFile } from 'dotenv';

fromFile({ path: '.env' });

export const config = {
  api: {
    url: process.env.WYRE_API_URL,
    secretKey: process.env.WYRE_API_SECRET_KEY,
    referrerAccountId: process.env.WYRE_REFERRER_ACCOUNT_ID,
  },
};

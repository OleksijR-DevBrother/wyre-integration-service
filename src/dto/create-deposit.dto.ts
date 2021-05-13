import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateDepositDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Transaction ID',
    type: String,
  })
  txid: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Destination currency (crypto)',
    type: String,
    example: 'BTC',
  })
  product: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'URL which will be triggered when payment will complete/fail',
    type: String,
    example: 'https://example.com/webhook',
  })
  callback_url: string;
}

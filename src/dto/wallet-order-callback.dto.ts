import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class WalletOrderUpdateDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Wallet order ID',
    type: String,
    example: 'WO_V9NDULU47Q',
  })
  orderId: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Wallet order reservation ID',
    type: String,
    example: 'XCN9ZYDNARG4BATHEN3B',
  })
  reservation: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Order status',
    type: String,
    example: 'FAILED',
  })
  orderStatus: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'Reason of failure (if status is "FAILED")',
    type: String,
    example: 'Order authorization failed. Order expired.',
  })
  failedReason?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetWidgetLinkDto {
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Source currency (fiat)',
    type: String,
    example: 'USD',
  })
  sourceCurrency?: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Destination currency (crypto)',
    type: String,
    example: 'BTC',
  })
  destinationCurrency: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Destination address',
    type: String,
    example: 'mmLrrESSuqD7qyK8ifiVgcy4TvS6JDrWoS',
  })
  destination: string;
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config';
import { Webhook } from './models/webhook.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.db.url,
      entities: ['src/**/*.entity{.js,.ts}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Webhook]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

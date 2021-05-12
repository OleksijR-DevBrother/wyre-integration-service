import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('webhooks')
export class Webhook {
  @PrimaryColumn()
  reservation: string;

  @Column()
  url: string;

  constructor(reservation: string, url: string) {
    this.reservation = reservation;
    this.url = url;
  }
}

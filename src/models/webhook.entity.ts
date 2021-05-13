import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('webhooks')
export class Webhook {
  @PrimaryColumn()
  txid: string;

  @PrimaryColumn()
  reservation: string;

  @Column()
  callback_url: string;

  constructor(txid: string, reservation: string, callback_url: string) {
    this.txid = txid;
    this.reservation = reservation;
    this.callback_url = callback_url;
  }
}

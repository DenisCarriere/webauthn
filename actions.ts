import { Struct, Name, Asset, Action } from '@greymass/eosio';

@Struct.type('transfer')
class Transfer extends Struct {
  @Struct.field('name') from!: Name;
  @Struct.field('name') to!: Name;
  @Struct.field('asset') quantity!: Asset;
  @Struct.field('string') memo!: string;
}

export function transfer(from: Name, to: Name, quantity: Asset, memo: string) {
  return Action.from({
    authorization: [
      {
        actor: from,
        permission: 'active',
      },
    ],
    account: 'eosio.token',
    name: 'transfer',
    data: Transfer.from({
      from,
      to,
      quantity,
      memo,
    }),
  });
}

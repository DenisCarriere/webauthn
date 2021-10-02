import { Struct, Name, Asset, Action, NameType, AssetType } from '@greymass/eosio';

@Struct.type('transfer')
class Transfer extends Struct {
  @Struct.field('name') from!: Name;
  @Struct.field('name') to!: Name;
  @Struct.field('asset') quantity!: Asset;
  @Struct.field('string') memo!: string;
}

export function transferAction( account: NameType, from: NameType, to: NameType, quantity: AssetType, memo: string ): Action {
  return Action.from({
    authorization: [ { actor: from, permission: "active" } ],
    account,
    name: 'transfer',
    data: Transfer.from({
      from,
      to,
      quantity,
      memo,
    }),
  })
}

const action = transferAction("eosio.token", "myaccount", "toaccount", "1.0000 EOS", "foo");
console.log(action.toJSON())
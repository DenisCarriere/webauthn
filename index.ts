import { createPublic, createSignature } from '@greymass/webauthn';
import {
  APIClient,
  Transaction,
  Struct,
  Name,
  Asset,
  Action,
  PublicKey,
  SignedTransaction,
  Bytes,
} from '@greymass/eosio';
import './style.css';

// Write TypeScript code!
const rawIdSpan: HTMLElement = document.getElementById('rawId');
const clientDataJSONSpan: HTMLElement =
  document.getElementById('clientDataJSON');
const attestationObjectSpan: HTMLElement =
  document.getElementById('attestationObject');
const publicKeySpan: HTMLElement = document.getElementById('publicKey');
const accountSpan: HTMLElement = document.getElementById('account');
const txidSpan: HTMLElement = document.getElementById('txid');

const account = 'testwebweb22';
const publicKey = PublicKey.from(
  'PUB_WA_JCuUfGJ9p1GN58uD7AxNDG92TR19uHi6WEPCKFC1aReXrQo8fVHy9R4K4GpjXswfKhTFpzcqZQAqL2jt42veNbAj1Ptn'
);

const rawId = Bytes.from(
  'f1af357bdb6ccd5479e7651c7b5c2f86be997497331610f959dc76081dd74bc048bc688dd5b57d0655d575162dc8e22626afec249d02d946482b617d474c3f51'
).array.buffer;
const clientDataJSON = Bytes.from(
  '7b2274797065223a22776562617574686e2e637265617465222c226368616c6c656e6765223a2276755f367a694b2d375f724f76755f367a7237762d73346976755f367a7237762d7334222c226f726967696e223a2268747470733a2f2f72656163742d74732d747a686e77782e737461636b626c69747a2e696f222c2263726f73734f726967696e223a66616c73652c226f746865725f6b6579735f63616e5f62655f61646465645f68657265223a22646f206e6f7420636f6d7061726520636c69656e74446174614a534f4e20616761696e737420612074656d706c6174652e205365652068747470733a2f2f676f6f2e676c2f796162506578227d'
).array.buffer;
const attestationObject = Bytes.from(
  'a363666d74646e6f6e656761747453746d74a068617574684461746158c4cf075c626509c8ad569d4a519bc4c3417e7317de62361e50134b05e0fe3190bb4100000000000000000000000000000000000000000040f1af357bdb6ccd5479e7651c7b5c2f86be997497331610f959dc76081dd74bc048bc688dd5b57d0655d575162dc8e22626afec249d02d946482b617d474c3f51a50102032620012158204475404cd266ba4638e0f75b1db8b64f2016c9b41cc7c65fe7ee0b2287929c0b2258207cbb375af42e67f20f0a567b40284e70a68b446544810258798d19ae9227fe2a'
).array.buffer;

const credentials = {
  rawId,
  response: {
    clientDataJSON,
    attestationObject,
  },
};

async function signTransaction() {
  const client = new APIClient({ url: 'https://jungle3.greymass.com' });
  const info = await client.v1.chain.get_info();
  const header = info.getTransactionHeader();
  const { chain_id } = info;

  @Struct.type('transfer')
  class Transfer extends Struct {
    @Struct.field('name') from!: Name;
    @Struct.field('name') to!: Name;
    @Struct.field('asset') quantity!: Asset;
    @Struct.field('string') memo!: string;
  }
  const action = Action.from({
    authorization: [
      {
        actor: account,
        permission: 'active',
      },
    ],
    account: 'eosio.token',
    name: 'transfer',
    data: Transfer.from({
      from: account,
      to: 'eosnationftw',
      quantity: '0.0042 EOS',
      memo: 'eosio-core is the best <3',
    }),
  });
  const transaction = Transaction.from({
    ...header,
    actions: [action],
  });
  console.log(transaction);
  console.log(chain_id);
  const transactionDigest = transaction.signingDigest(chain_id);

  // sign transaction
  const assertion: any = await navigator.credentials.get({
    publicKey: {
      timeout: 60000,
      // credentials we created before
      allowCredentials: [
        {
          id: credentials.rawId,
          type: 'public-key',
        },
      ],
      // the transaction you want to sign
      challenge: transactionDigest.array.buffer,
    },
  });

  console.log(
    'authenticatorData',
    Bytes.from(assertion.response.authenticatorData).toString()
  );
  console.log('signature', Bytes.from(assertion.response.signature).toString());
  console.log(
    'clientDataJSON',
    Bytes.from(assertion.response.clientDataJSON).toString()
  );
  console.log('assertion.response:', assertion.response);
  const signature = createSignature(publicKey, assertion.response);
  console.log('signature:', signature);
  const signedTransaction = SignedTransaction.from({
    ...transaction,
    signatures: [signature],
  });
  console.log('signedTransaction:', signedTransaction.toString());
  console.log('signature:', signature.toString());
  const tx_id = await client.v1.chain.push_transaction(signedTransaction);
  console.log(tx_id);
}

async function getPublicKey() {
  const credentials: any = await navigator.credentials.create({
    publicKey: {
      // Your website domain name and display name
      // note that your website must be served over https or signatures will not be valid
      rp: { id: 'typescript-ks2dqm.stackblitz.io', name: 'Greymass Inc.' },
      user: {
        // any old bytes(?)
        id: new Uint8Array([0xbe, 0xef, 0xfa, 0xce]),
        // username, usually the users account name but doesn't have to be
        name: 'teamgreymass',
        // will be displayed when the user asks to sing
        displayName: 'Team Greymass @ Jungle 3 TestNet',
      },
      // don't change this, eosio will only work with -7 == EC2
      pubKeyCredParams: [
        {
          type: 'public-key',
          alg: -7,
        },
      ],
      timeout: 60000,
      // can be any bytes, more than 16 or some browser may complain
      challenge: new Uint8Array([
        0xbe, 0xef, 0xfa, 0xce, 0x22, 0xbe, 0xef, 0xfa, 0xce, 0xbe, 0xef, 0xfa,
        0xce, 0xbe, 0xef, 0xfa, 0xce, 0x22, 0xbe, 0xef, 0xfa, 0xce, 0xbe, 0xef,
        0xfa, 0xce,
      ]).buffer,
    },
  });
  const { response, rawId } = credentials;
  const { clientDataJSON, attestationObject } = response;
  const publicKey = createPublic(credentials.response);

  console.log(publicKey.toJSON());
  console.log('rawId', Bytes.from(rawId).toString());
  console.log('clientDataJSON', Bytes.from(clientDataJSON).toString());
  console.log('attestationObject', Bytes.from(attestationObject).toString());
  rawIdSpan.innerHTML = Bytes.from(rawId).toString();
  clientDataJSONSpan.innerHTML = Bytes.from(clientDataJSON).toString();
  attestationObjectSpan.innerHTML = Bytes.from(attestationObject).toString();
  publicKeySpan.innerHTML = publicKey.toString();
}

function createAccount() {
  accountSpan.innerHTML = 'TO-DO';
}

// function signTransaction() {
//   txidSpan.innerHTML = 'TO-DO';
// }

document
  .querySelector('#buttonCreateKey')
  .addEventListener('click', async () => {
    getPublicKey();
  });

document
  .querySelector('#buttonCreateAccount')
  .addEventListener('click', async () => {
    createAccount();
  });

document
  .querySelector('#buttonSignTransaction')
  .addEventListener('click', async () => {
    signTransaction();
  });

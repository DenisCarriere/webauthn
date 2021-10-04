import { createPublic, createSignature } from '@greymass/webauthn';
import {
  Transaction,
  PublicKey,
  SignedTransaction,
  Bytes,
} from '@greymass/eosio';
import './style.css';
import { get_chain } from './utils';
import { transferAction } from './actions';
import { client } from './config';

// localStorage
const localStorage = window.localStorage;

// HTML items
const html = {
  rawId: document.getElementById('rawId'),
  clientDataJSON: document.getElementById('clientDataJSON'),
  attestationObject: document.getElementById('attestationObject'),
  publicKey: document.getElementById('publicKey'),
  account: document.getElementById('account'),
};

// const account = localStorage.getItem("account");
// const publicKey = localStorage.getItem("publicKey") ? PublicKey.from(localStorage.getItem("publicKey")) : "";
const rawId = Bytes.from(localStorage.getItem('rawId') || '').array.buffer;
const clientDataJSON = Bytes.from(localStorage.getItem('clientDataJSON') || '')
  .array.buffer;
const attestationObject = Bytes.from(
  localStorage.getItem('attestationObject') || ''
).array.buffer;

const credentials = {
  rawId,
  response: {
    clientDataJSON,
    attestationObject,
  },
};

async function signTransaction(publicKey: PublicKey) {
  const { chain_id, header } = await get_chain();

  const action = transferAction(
    'myaccount',
    'toaccount',
    '0.0048 EOS',
    'Greymass Core'
  );
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
  html.rawId.innerHTML = Bytes.from(rawId).toString();
  html.clientDataJSON.innerHTML = Bytes.from(clientDataJSON).toString();
  html.attestationObject.innerHTML = Bytes.from(attestationObject).toString();
  html.publicKey.innerHTML = publicKey.toString();
}

function createAccount() {
  html.account.innerHTML = 'TO-DO';
}

// function signTransaction() {
//   txidHTML.innerHTML = 'TO-DO';
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
    const publicKey = PublicKey.from(localStorage.getItem('publicKey'));
    signTransaction(publicKey);
  });

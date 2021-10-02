import { client } from './config';

export async function get_chain() {
  const info = await client.v1.chain.get_info();
  const header = info.getTransactionHeader();
  return { header, chain_id: info.chain_id };
}

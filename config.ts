import { APIClient } from '@greymass/eosio';
import fetch from "isomorphic-fetch";

export const client = new APIClient({ url: 'https://jungle3.greymass.com', fetch });

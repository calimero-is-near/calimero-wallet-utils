import { CalimeroWalletUtils } from "calimero-wallet-utils";
import { KeyPair, InMemorySigner} from 'near-api-js';
import * as NearAPI from 'near-api-js';

// This is example only, priv key should always reside inside wallet, never use it raw
const PRIVATE_KEY = '';

// Account id for corresponding private key
const ACCOUNT_ID = ''

const config = {
  shardId: 'public-portal-calimero',
  calimeroUrl: 'https://app.calimero.network',
  rpcEndpoint: 'https://api.calimero.network/api/v1/shards/cali-public-portal-calimero/neard-rpc/',
  walletNetworkId: 'mainnet'
}
const aTestnetConfig = {
  shardId: 'chat-calimero-testnet',
  calimeroUrl: 'https://alpha.app.staging.calimero.network',
  rpcEndpoint: 'https://api.staging.calimero.network/api/v1/shards/ws-chat-calimero-testnet/neard-rpc/',
  walletNetworkId: 'testnet'
}
const walletUtils = CalimeroWalletUtils.init(config);

const keyPair = KeyPair.fromString(PRIVATE_KEY);
const signer = await InMemorySigner.fromKeyPair(config.walletNetworkId, ACCOUNT_ID, keyPair);

// 1) Sync the account to Calimero shard, so that account with same name as on NEAR gets created on Calimero
try {
  const response = await walletUtils.syncPrivateShardAccount(ACCOUNT_ID, signer);
} catch(e) {
  console.log("Failed syncing to Calimero shard");
  process.exit();
}
console.log("Account synced to Calimero shard");

const keyStore = new NearAPI.keyStores.InMemoryKeyStore();
keyStore.setKey(
  config.walletNetworkId,
  ACCOUNT_ID,
  keyPair,
);

// 2) get a new x signature to supply it to the Calimero connection object
const xSignature = await walletUtils.generatePrivateShardXSignature(ACCOUNT_ID, signer);
console.log('x-signature: ', xSignature);

// 3) Create Calimero connection in order to send txs, read state etc.
const calimero = await walletUtils.getCalimeroConnection(keyStore, xSignature);

// 4) Interact with Calimero, e.g. read latest calimero block
const block = await calimero.connection.provider.block({ finality: "final" });
console.log(`${config.shardId} latest block: ${block.header.height}`);

// 5) E.g. Add new full access key on Calimero
const account = await calimero.account(ACCOUNT_ID);
const someRandomKeypair = NearAPI.utils.KeyPairEd25519.fromRandom();
const addKey = await account.addKey(someRandomKeypair.publicKey);

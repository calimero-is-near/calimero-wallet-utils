# Calimero wallet integration utils

Calimero is a NEAR side chain - a separate chain from NEAR, but we still want the users to be able to login with their NEAR mainnet accounts. First step is syncing their full access keys from NEAR mainnet to Calimero. Also, after that - function access key to a DAPP that requests access to Calimero can be added.

## Syncing account from NEAR to Calimero

Init wallet utils, e.g.:

```typescript
import { CalimeroWalletUtils } from "calimero-wallet-utils";

const config = {
  shardId: 'public-portal-calimero',
  calimeroUrl: 'https://app.calimero.network',
  rpcEndpoint: 'https://api.calimero.network/api/v1/shards/cali-public-portal-calimero/neard-rpc/',
  walletNetworkId: 'mainnet'
}

const walletUtils = CalimeroWalletUtils.init(config);
```

Sync account:

```typescript
await walletUtils.syncPrivateShardAccount(ACCOUNT_ID, signer);
```

where `ACCOUNT_ID` is near account to be synced and `signer` is the near-api-js Signer object containg corresponding private key in the keystore, e.g.:

```typescript
const keyPair = KeyPair.fromString(PRIVATE_KEY);
const signer = await InMemorySigner.fromKeyPair(config.walletNetworkId, ACCOUNT_ID, keyPair);
```

## Interacting with Calimero

Request a token by calling:

```typescript
const xSignature = await walletUtils.generatePrivateShardXSignature(ACCOUNT_ID, signer);
```

Create a Calimero connection:

```typescript
const calimero = await walletUtils.getCalimeroConnection(keyStore, xSignature);
```

Make calls to Calimero, e.g. read latest block:

```typescript
const block = await calimero.connection.provider.block({ finality: "final" });
console.log(`${config.shardId} latest block: ${block.header.height}`);
```

Add new key to your account on Calimero:

```typescript
const account = await calimero.account(ACCOUNT_ID);
const someRandomKeypair = NearAPI.utils.KeyPairEd25519.fromRandom();
const addKey = await account.addKey(someRandomKeypair.publicKey);
```

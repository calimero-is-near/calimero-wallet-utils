import { CalimeroWalletUtils } from '../index';
import { KeyPair, InMemorySigner } from 'near-api-js';

test('Verify signature for challenge', async () => {
  const config = {
    shardId: '',
    rpcEndpoint: '',
    calimeroUrl: '',
    walletNetworkId: '',
  };
  const walletUtils = CalimeroWalletUtils.init(config);

  const PRIVATE_KEY =
    'ed25519:5bftebifibPGnKrQ1p9EMgfzKzpymWjnDEkDf9Rv1ZYa8TuiTqb8XKX2Fp722grWYqtGLhz8gdYpgxekrjGWoS9B';
  const ACCOUNT_ID = 'mockwallet.testnet';

  const keyPair = KeyPair.fromString(PRIVATE_KEY);
  const signer = await InMemorySigner.fromKeyPair(config.shardId, ACCOUNT_ID, keyPair);

  let sibObj = await walletUtils.signatureForChallenge(ACCOUNT_ID, signer, 'a mock challenge');

  expect(sibObj.signature).toBe(
    '2V0NPo9caL3oTSSbrHjRKbxM8dgmEBc2A1pZ3hGg6lNTAQYBzPLYu2KtPrKgZAYQ0Z2Xe3jSvKiC4PZ8rwTPBg==',
  );
});

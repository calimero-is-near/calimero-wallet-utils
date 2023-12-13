import { keyStores, Near } from 'near-api-js';
import * as NearAPI from 'near-api-js';
export interface ICalimeroConfig {
  shardId: string;
  calimeroUrl: string;
  rpcEndpoint: string;
  walletNetworkId: string; // keys stored in keystore under this key
}

export class CalimeroWalletUtils {
  public static init(config: ICalimeroConfig): CalimeroWalletUtils {
    return new CalimeroWalletUtils(config);
  }

  private config: ICalimeroConfig;

  private constructor(config: ICalimeroConfig) {
    this.config = config;
  }

  public async fetchChallenge() {
    const response = await fetch(`${this.config.calimeroUrl}/api/public/challenge`, {
      headers: {
        'Content-type': 'application/json; charset=utf-8',
      },
      method: 'POST',
    });
    if (!response.ok) {
      const body = await response.text();
      let parsedBody;

      try {
        parsedBody = JSON.parse(body);
      } catch (e) {
        throw new Error(`${response.status} ${body}`);
      }

      throw new Error(`${response.status}, ${parsedBody}`);
    }
    return await response.json();
  }

  public async signatureForChallenge(accountId: string, signer: NearAPI.Signer, challenge: string) {
    const signed = await signer.signMessage(Buffer.from(challenge), accountId, this.config.walletNetworkId);
    const signature = Buffer.from(signed.signature).toString('base64');
    const publicKey = signed.publicKey.toString();

    return { challenge, signature, publicKey, accountId };
  }

  public async generatePrivateShardXSignature(accountId: string, signer: NearAPI.Signer) {
    const challenge = await this.fetchChallenge();
    const signedChallenge = await this.signatureForChallenge(accountId, signer, challenge.data);
    const encodedSig = Buffer.from(JSON.stringify(signedChallenge)).toString('base64');
    return encodedSig;
  }
  public async syncPrivateShardAccount(accountId: string, signer: NearAPI.Signer) {
    const xSignature = await this.generatePrivateShardXSignature(accountId, signer);
    await this.syncAccount(accountId, xSignature);
  }

  public async getCalimeroConnection(keyStore: keyStores.KeyStore, xSignature: string): Promise<Near> {
    const calimero = await NearAPI.connect({
      headers: {
        'x-signature': xSignature,
      },
      keyStore,
      networkId: this.config.walletNetworkId,
      nodeUrl: this.config.rpcEndpoint,
    });
    return calimero;
  }

  private async syncAccount(accountId: string, xSignature: string) {
    const postData = {
      accountId,
      shardId: this.config.shardId,
    };
    const response = await fetch(`${this.config.calimeroUrl}/api/public/sync`, {
      body: JSON.stringify(postData),
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'x-signature': xSignature,
      },
      method: 'POST',
    });
    if (!response.ok) {
      const body = await response.text();
      let parsedBody;

      try {
        parsedBody = JSON.parse(body);
      } catch (e) {
        throw new Error(`${response.status} ${body}`);
      }

      throw new Error(`${response.status}, ${parsedBody}`);
    }
    return await response.json();
  }
}

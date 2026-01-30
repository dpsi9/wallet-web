import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import * as nacl from "tweetnacl";

// generates mnemonics and derives multiple keypairs from seed
export class SolanaHDWallet {
  private mnemonic: string;
  private seed: Buffer;

  constructor(mnemonic?: string) {
    if (mnemonic) {
      this.validateMnemonic(mnemonic);
      this.mnemonic = mnemonic;
    } else {
      this.mnemonic = this.generateMnemonic();
    }

    this.seed = this.generateSeed();
  }

  public getMnemonic(): string {
    return this.mnemonic;
  }

  public getSeed(): Buffer {
    return this.seed;
  }

  private generateMnemonic(): string {
    return bip39.generateMnemonic(128);
  }

  private validateMnemonic(mnemonic: string): void {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error("Invalid mnemonic phrase");
    }
  }

  private generateSeed(): Buffer {
    return bip39.mnemonicToSeedSync(this.mnemonic);
  }

  //Standard Solana path: m/44'/501'/{account}'/{index}'
  public deriveKeypair(account: number = 0, index: number = 0): Keypair {
    const path = `m/44'/501'/${account}'/${index}'`;
    return this.deriveKeypairFromPath(path);
  }

  public deriveKeypairFromPath(path: string): Keypair {
    const derivedSeed = derivePath(path, this.seed.toString("hex")).key;
    const secretKey = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    return Keypair.fromSecretKey(secretKey);
  }

  // generate multiple wallets for the same account
  public generateMultipleWallets(
    count: number,
    account: number = 0,
  ): Array<{
    index: number;
    keypair: Keypair;
    publicKey: string;
    secretKey: string;
  }> {
    const wallets = [];

    for (let i = 0; i < count; i++) {
      const keypair = this.deriveKeypair(account, i);
      wallets.push({
        index: i,
        keypair,
        publicKey: keypair.publicKey.toString(),
        secretKey: Buffer.from(keypair.secretKey).toString("hex"),
      });
    }
    return wallets;
  }

  // get the wallet from the mnemonic/recovery phrase
  static recover(mnemonic: string): SolanaHDWallet {
    return new SolanaHDWallet(mnemonic);
  }

  // validate public/private keypair
  public validateKeypair(secretKey: Uint8Array, publicKey: string): boolean {
    try {
      const keypair = Keypair.fromSecretKey(secretKey);
      return keypair.publicKey.toString() === publicKey;
    } catch {
      return false;
    }
  }
}

export class WalletManager {
  private hdWallet: SolanaHDWallet | null = null;

  // initialize with new or existing wallet
  initialize(mnemonic?: string): void {
    this.hdWallet = mnemonic ? SolanaHDWallet.recover(mnemonic) : new SolanaHDWallet();
  }

  // get curr mnemonic
  getMnemonic(): string {
    if (!this.hdWallet) {
      throw new Error("Wallet not initialized");
    } else {
      return this.hdWallet.getMnemonic();
    }
  }

  // get primary wallet account = 0, index = 0
  getPrimaryWallet(): Keypair {
    if (!this.hdWallet) {
      throw new Error("Wallet not initialized");
    }
    return this.hdWallet.deriveKeypair(0, 0);
  }

  // get multiple wallets for dashboard
  getWalletDashboard(count: number = 5) {
    if (!this.hdWallet) {
      throw new Error("Wallet not initialized");
    }

    const wallets = this.hdWallet.generateMultipleWallets(count);

    return wallets.map((wallet, i) => ({
      id: i,
      name: `Wallet ${i + 1}`,
      publicKey: wallet.publicKey,
      shortAddress: `${wallet.publicKey.slice(0, 4)}...${wallet.publicKey.slice(-4)}`,
      derivationPath: `m/44'/501'/0'/${i}`,
    }));
  }

  clear(): void {
    this.hdWallet = null;
  }
}

export type { Keypair };

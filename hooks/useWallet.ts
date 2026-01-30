import { useState, useCallback } from "react";
import { SolanaHDWallet } from "@/chain/solana/wallet";

export const useWallet = () => {
  const [wallet, setWallet] = useState<SolanaHDWallet | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);

  const createNewWallet = useCallback(() => {
    const newWallet = new SolanaHDWallet();
    setWallet(newWallet);
    return newWallet.getMnemonic();
  }, []);

  const recoverWallet = useCallback((mnemonic: string) => {
    const recoverd = SolanaHDWallet.recover(mnemonic);
    setWallet(recoverd);
    return recoverd;
  }, []);

  const generateWallet = useCallback(
    (count: number) => {
      if (!wallet) return [];
      const generated = wallet.generateMultipleWallets(count);
      setWallets(generated);
      return generated;
    },
    [wallet],
  );

  const getPrimaryWallet = useCallback(() => {
    if (!wallet) return null;
    return wallet.deriveKeypair(0, 0);
  }, [wallet]);

  return {
    wallet,
    wallets,
    createNewWallet,
    recoverWallet,
    generateWallet,
    getPrimaryWallet,
    isInitialized: !!wallet,
  };
};

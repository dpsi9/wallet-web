import { useState, useCallback, useEffect } from "react";
import { SolanaHDWallet } from "@/chain/solana/wallet";

const WALLET_STORAGE_KEY = "solana_wallet_mnemonic";

export const useWallet = () => {
  const [wallet, setWallet] = useState<SolanaHDWallet | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore wallet from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      const storedMnemonic = localStorage.getItem(WALLET_STORAGE_KEY);
      if (storedMnemonic) {
        const recovered = SolanaHDWallet.recover(storedMnemonic);
        setWallet(recovered);
      }
    } catch (err) {
      console.error("Failed to restore wallet from storage:", err);
      localStorage.removeItem(WALLET_STORAGE_KEY);
    }
    setIsHydrated(true);
  }, []);

  const createNewWallet = useCallback(() => {
    const newWallet = new SolanaHDWallet();
    setWallet(newWallet);
    
    if (typeof window !== "undefined") {
      localStorage.setItem(WALLET_STORAGE_KEY, newWallet.getMnemonic());
    }
    
    return newWallet.getMnemonic();
  }, []);

  const recoverWallet = useCallback((mnemonic: string) => {
    const recovered = SolanaHDWallet.recover(mnemonic);
    setWallet(recovered);
    
    if (typeof window !== "undefined") {
      localStorage.setItem(WALLET_STORAGE_KEY, mnemonic);
    }
    
    return recovered;
  }, []);

  const clearWallet = useCallback(() => {
    setWallet(null);
    setWallets([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(WALLET_STORAGE_KEY);
    }
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
    clearWallet,
    isInitialized: !!wallet,
    isHydrated,
  };
};

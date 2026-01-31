"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useWallet as useWalletState } from "@/hooks/useWallet";
import type { SolanaHDWallet } from "@/chain/solana/wallet";
import type { TokenData } from "@/types/tokenData";
import { sendSol } from "@/chain/solana/sendSol";
import { swap } from "@/chain/solana/swap";
import { getBalance } from "@/chain/solana/balances";
import { getUserAssets } from "@/chain/solana/getUserAssets";
import { address } from "@solana/kit";

export type Network = "mainnet" | "devnet";

export interface Transaction {
  id: string;
  type: "send" | "receive" | "swap";
  status: "pending" | "confirmed" | "failed";
  amount: number;
  token: string;
  address?: string;
  timestamp: number;
  fee?: number;
  signature?: string;
}

export interface WalletContextValue {
  wallet: SolanaHDWallet | null;
  wallets: any[];
  createNewWallet: () => string;
  recoverWallet: (mnemonic: string) => SolanaHDWallet;
  generateWallet: (count: number) => any[];
  getPrimaryWallet: () => any | null;
  clearWallet: () => void;
  isInitialized: boolean;
  isHydrated: boolean;
  activeWallet: {
    id: string;
    name: string;
    address: string;
    balance: number;
    seedPhrase?: string;
  } | null;
  tokens: TokenData[];
  transactions: Transaction[];
  network: Network;
  setNetwork: (network: Network) => void;
  currentView: "landing" | "create" | "import" | "dashboard";
  setCurrentView: (view: WalletContextValue["currentView"]) => void;
  sendTransaction: (recipient: string, amountLamports: bigint) => Promise<string>;
  swapTokens: (inputMint: string, outputMint: string, amount: number) => Promise<any>;
  refreshBalance: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const walletState = useWalletState();
  const [network, setNetwork] = useState<Network>("mainnet");
  const [currentView, setCurrentView] = useState<WalletContextValue["currentView"]>(
    "landing",
  );
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the primary keypair to prevent infinite re-renders
  const primaryKeypair = useMemo(() => {
    return walletState.wallet ? walletState.getPrimaryWallet() : null;
  }, [walletState.wallet]);
  
  // Memoize the public key string for use in callbacks
  const publicKeyStr = useMemo(() => {
    return primaryKeypair?.publicKey.toString() ?? null;
  }, [primaryKeypair]);
  
  const solBalance = tokens.find((token) => token.symbol === "SOL")?.balance ?? 0;
  
  const activeWallet = publicKeyStr
    ? {
        id: "primary",
        name: "Primary Wallet",
        address: publicKeyStr,
        balance: solBalance,
        seedPhrase: walletState.wallet?.getMnemonic(),
      }
    : null;

  const clearError = useCallback(() => setError(null), []);

  // Refresh SOL balance
  const refreshBalance = useCallback(async () => {
    if (!publicKeyStr) return;
    
    setIsLoading(true);
    try {
      const balance = await getBalance(address(publicKeyStr), network);
      const solLamports = balance / 1e9; // Convert lamports to SOL
      
      setTokens(prev => {
        const solIndex = prev.findIndex(t => t.symbol === "SOL");
        const solToken: TokenData = {
          mint: "So11111111111111111111111111111111111111112",
          name: "Solana",
          symbol: "SOL",
          balance: solLamports,
          decimals: 9,
          verified: true,
        };
        
        if (solIndex >= 0) {
          const updated = [...prev];
          updated[solIndex] = solToken;
          return updated;
        }
        return [solToken, ...prev];
      });
    } catch (err) {
      console.error("Failed to refresh balance:", err);
      setError("Failed to refresh balance");
    } finally {
      setIsLoading(false);
    }
  }, [publicKeyStr, network]);

  // Refresh all tokens
  const refreshTokens = useCallback(async () => {
    if (!publicKeyStr) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Get SOL balance first
      const solBalance = await getBalance(address(publicKeyStr), network);
      const solToken: TokenData = {
        mint: "So11111111111111111111111111111111111111112",
        name: "Solana",
        symbol: "SOL",
        balance: solBalance / 1e9,
        decimals: 9,
        verified: true,
      };
      
      // Set SOL balance immediately so user sees something
      setTokens(prev => {
        const nonSol = prev.filter(t => t.symbol !== "SOL");
        return [solToken, ...nonSol];
      });
      
      // Small delay to avoid rate limiting before fetching other tokens
      await new Promise(r => setTimeout(r, 500));
      
      // Get other tokens
      const { trusted, untrusted } = await getUserAssets(address(publicKeyStr), network);
      
      setTokens([solToken, ...trusted, ...untrusted]);
    } catch (err: any) {
      console.error("Failed to refresh tokens:", err);
      const message = err?.message?.includes("429") 
        ? "Rate limited - please wait a moment and try again"
        : "Failed to fetch tokens";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [publicKeyStr, network]);

  // Send SOL transaction
  const sendTransaction = useCallback(async (recipient: string, amountLamports: bigint): Promise<string> => {
    if (!primaryKeypair) throw new Error("Wallet not initialized");
    
    setIsLoading(true);
    setError(null);
    
    const txId = `tx_${Date.now()}`;
    const pendingTx: Transaction = {
      id: txId,
      type: "send",
      status: "pending",
      amount: Number(amountLamports) / 1e9,
      token: "SOL",
      address: recipient,
      timestamp: Date.now(),
    };
    
    setTransactions(prev => [pendingTx, ...prev]);
    
    try {
      const walletBytes = primaryKeypair.secretKey;
      const signature = await sendSol(walletBytes, recipient, amountLamports, network);
      
      // Update transaction status
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === txId 
            ? { ...tx, status: "confirmed" as const, signature } 
            : tx
        )
      );
      
      // Refresh balance after send
      await refreshBalance();
      
      return signature;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
      
      // Update transaction status to failed
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === txId 
            ? { ...tx, status: "failed" as const } 
            : tx
        )
      );
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [primaryKeypair, refreshBalance, network]);

  // Swap tokens
  const swapTokens = useCallback(async (inputMint: string, outputMint: string, amount: number): Promise<any> => {
    if (!primaryKeypair) throw new Error("Wallet not initialized");
    
    setIsLoading(true);
    setError(null);
    
    const txId = `swap_${Date.now()}`;
    const pendingTx: Transaction = {
      id: txId,
      type: "swap",
      status: "pending",
      amount,
      token: inputMint,
      timestamp: Date.now(),
    };
    
    setTransactions(prev => [pendingTx, ...prev]);
    
    try {
      const walletBytes = primaryKeypair.secretKey;
      const taker = primaryKeypair.publicKey.toString();
      
      const result = await swap(inputMint, outputMint, amount, taker, walletBytes);
      
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === txId 
            ? { ...tx, status: "confirmed" as const, signature: result.signature } 
            : tx
        )
      );
      
      // Refresh tokens after swap
      await refreshTokens();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Swap failed";
      setError(errorMessage);
      
      // Update transaction status to failed
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === txId 
            ? { ...tx, status: "failed" as const } 
            : tx
        )
      );
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [primaryKeypair, refreshTokens]);

  // Fetch tokens when wallet is initialized
  useEffect(() => {
    if (walletState.isInitialized && publicKeyStr) {
      refreshTokens();
    }
  }, [walletState.isInitialized, publicKeyStr, refreshTokens]);

  // When wallet is restored from localStorage, navigate to dashboard
  useEffect(() => {
    if (walletState.isHydrated && walletState.isInitialized) {
      setCurrentView("dashboard");
    }
  }, [walletState.isHydrated, walletState.isInitialized]);

  // Refresh tokens when network changes
  useEffect(() => {
    if (walletState.isInitialized && publicKeyStr) {
      // Clear tokens first to show loading state
      setTokens([]);
      refreshTokens();
    }
  }, [network]); 

  const value = useMemo<WalletContextValue>(
    () => ({
      ...walletState,
      activeWallet,
      tokens,
      transactions,
      network,
      setNetwork,
      currentView,
      setCurrentView,
      sendTransaction,
      swapTokens,
      refreshBalance,
      refreshTokens,
      isLoading,
      error,
      clearError,
    }),
    [walletState, activeWallet, tokens, transactions, network, currentView, sendTransaction, swapTokens, refreshBalance, refreshTokens, isLoading, error, clearError],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
}

"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { useWallet as useWalletState } from "@/hooks/useWallet";
import type { SolanaHDWallet } from "@/chain/solana/wallet";
import type { TokenData } from "@/types/tokenData";

export type Network = "mainnet" | "devnet";

export interface WalletContextValue {
  wallet: SolanaHDWallet | null;
  wallets: any[];
  createNewWallet: () => string;
  recoverWallet: (mnemonic: string) => SolanaHDWallet;
  generateWallet: (count: number) => any[];
  getPrimaryWallet: () => any | null;
  isInitialized: boolean;
  activeWallet: {
    id: string;
    name: string;
    address: string;
    balance: number;
    seedPhrase?: string;
  } | null;
  tokens: TokenData[];
  transactions: {
    id: string;
    type: "send" | "receive" | "swap";
    status: "pending" | "confirmed" | "failed";
    amount: number;
    token: string;
    address?: string;
    timestamp: number;
    fee?: number;
  }[];
  network: Network;
  setNetwork: (network: Network) => void;
  currentView: "landing" | "create" | "import" | "dashboard";
  setCurrentView: (view: WalletContextValue["currentView"]) => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const walletState = useWalletState();
  const [network, setNetwork] = useState<Network>("mainnet");
  const [currentView, setCurrentView] = useState<WalletContextValue["currentView"]>(
    "landing",
  );
  const [tokens] = useState<TokenData[]>([]);
  const [transactions] = useState<WalletContextValue["transactions"]>([]);

  const primaryKeypair = walletState.getPrimaryWallet();
  const solBalance = tokens.find((token) => token.symbol === "SOL")?.balance ?? 0;
  const activeWallet = primaryKeypair
    ? {
        id: "primary",
        name: "Primary Wallet",
        address: primaryKeypair.publicKey.toString(),
        balance: solBalance,
        seedPhrase: walletState.wallet?.getMnemonic(),
      }
    : null;

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
    }),
    [walletState, activeWallet, tokens, transactions, network, currentView],
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

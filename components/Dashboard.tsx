"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useWalletContext } from "@/contexts/WalletContext";
import {
  LayoutDashboard,
  Coins,
  ArrowLeftRight,
  Send,
  Activity,
  Settings,
  Copy,
  Check,
  ChevronDown,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { TokenList } from "@/components/TokenList";
import { SendFlow } from "@/components/SendFlow";
import { SwapPanel } from "@/components/SwapPanel";
import { ActivityList } from "@/components/ActivityList";
import { SettingsPanel } from "@/components/SettingsPanel";

export function Dashboard() {
  const { activeWallet, network, tokens, isInitialized, generateWallet, wallets, refreshTokens, isLoading } = useWalletContext();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [addressCopied, setAddressCopied] = useState(false);
  const [revealedWallets, setRevealedWallets] = useState<Record<string, boolean>>({});
  const [showWallets, setShowWallets] = useState(false);

  const solBalance = useMemo(
    () => tokens.find((token) => token.symbol === "SOL")?.balance ?? 0,
    [tokens],
  );

  if (!isInitialized || !activeWallet) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(activeWallet.address);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  const handleAddWallet = () => {
    const nextCount = Math.max(1, wallets.length + 1);
    generateWallet(nextCount);
  };

  const handleClearWallets = () => {
    generateWallet(0);
    setRevealedWallets({});
  };

  const toggleSecret = (publicKey: string) => {
    setRevealedWallets((prev) => ({
      ...prev,
      [publicKey]: !prev[publicKey],
    }));
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tokens", label: "Tokens", icon: Coins },
    { id: "swap", label: "Swap", icon: ArrowLeftRight },
    { id: "send", label: "Send", icon: Send },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <motion.div
      className="min-h-screen bg-[#0a0a0c] flex flex-col md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-60 bg-[#0f0f12] border-r border-white/5 flex-col overflow-x-auto md:overflow-visible">
        {/* Branding */}
        <div className="p-4 md:p-5 pb-4 md:pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/25">
              <Wallet className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="text-base font-semibold text-white">PocketWallet</span>
          </div>
        </div>

        {/* Wallet Selector */}
        <div className="px-3 md:px-4 pb-4 md:pb-5">
          <button className="w-full bg-[#16161a] hover:bg-[#1a1a1f] border border-white/5 rounded-xl p-3.5 transition-colors text-left">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-white">{activeWallet.name}</p>
                <p className="text-xs text-white/40 font-mono mt-0.5">
                  {truncateAddress(activeWallet.address)}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-white/40" />
            </div>
          </button>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2 md:mt-3">
            <Button
              onClick={handleAddWallet}
              size="sm"
              className="flex-1 h-9 bg-primary text-black font-medium hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add
            </Button>
            <Button
              onClick={handleCopyAddress}
              size="sm"
              variant="outline"
              className="flex-1 h-9 bg-transparent border-white/10 text-white hover:bg-white/5"
            >
              {addressCopied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
              Copy
            </Button>
          </div>

          <button
            onClick={handleClearWallets}
            className="flex items-center gap-2 mt-3 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All Wallets
          </button>
        </div>

        {/* Navigation */}
        <div className="px-3 md:px-4 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-white/30 mb-3 px-2">Menu</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Network Status */}
        <div className="p-3 md:p-4 mt-auto">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className={`w-2 h-2 rounded-full ${network === "mainnet" ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span className="text-xs text-white/50 capitalize">{network === "mainnet" ? "Mainnet" : "Devnet"}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-14 md:h-16 border-b border-white/5 px-3 md:px-6 flex items-center justify-between bg-[#0a0a0c]">
          <h1 className="text-lg font-semibold text-white">
            {navItems.find(item => item.id === activeTab)?.label || "Dashboard"}
          </h1>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => refreshTokens()}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="h-9 bg-transparent border-white/10 text-white/70 hover:text-white hover:bg-white/5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-3 md:p-6 bg-[#0a0a0c]">
          {activeTab === "dashboard" && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Left Column - Balance & Assets */}
              <div className="md:col-span-2 space-y-4 md:space-y-5">
                {/* Total Balance Card */}
                <div className="bg-[#12121a] border border-white/5 rounded-2xl p-4 md:p-6">
                  <div className="flex items-start justify-between mb-4 md:mb-5">
                    <div>
                      <p className="text-sm text-white/50 mb-2">Total Balance</p>
                      <p className="text-2xl md:text-4xl font-bold text-white">
                        {solBalance.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} SOL
                      </p>
                    </div>
                    <button className="text-white/30 hover:text-white/60 transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 md:gap-3">
                    <Button
                      onClick={() => setActiveTab("send")}
                      className="flex-1 h-12 bg-[#1a1a24] hover:bg-[#22222e] text-white border border-white/5 font-medium"
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 bg-transparent border-white/10 text-white hover:bg-white/5 font-medium"
                    >
                      <ArrowDownLeft className="w-4 h-4 mr-2" />
                      Receive
                    </Button>
                  </div>
                </div>

                {/* Assets Section */}
                <div className="bg-[#12121a] border border-white/5 rounded-2xl p-4 md:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-base font-semibold text-white">Assets</h3>
                    <button 
                      onClick={() => setActiveTab("tokens")}
                      className="text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      View All
                    </button>
                  </div>

                    <div className="space-y-2">
                    {/* SOL Token */}
                    <div className="flex items-center justify-between p-2.5 md:p-3.5 bg-[#16161e] rounded-xl hover:bg-[#1a1a24] transition-colors">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-white text-sm">Solana</p>
                          <p className="text-xs text-white/40">SOL</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="text-right">
                          <p className="font-medium text-white text-sm">{solBalance.toFixed(4)} SOL</p>
                        </div>
                        <Button
                          onClick={() => setActiveTab("send")}
                          size="sm"
                          className="h-8 px-3 md:px-4 bg-[#1e1e28] hover:bg-[#26263a] text-white text-xs border border-white/5"
                        >
                          Send
                        </Button>
                      </div>
                    </div>

                    {/* Other verified tokens */}
                    {tokens.filter(t => t.symbol !== "SOL" && t.verified).slice(0, 3).map(token => (
                      <div key={token.mint} className="flex items-center justify-between p-2.5 md:p-3.5 bg-[#16161e] rounded-xl hover:bg-[#1a1a24] transition-colors">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-white text-sm">{token.name}</p>
                            <p className="text-xs text-white/40">{token.symbol}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                          <div className="text-right">
                            <p className="font-medium text-white text-sm">{token.balance.toFixed(4)}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* No other tokens message */}
                    {tokens.filter(t => t.symbol !== "SOL" && t.verified).length === 0 && (
                      <div className="text-center py-6 text-white/30 text-sm">
                        No other tokens found
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Quick Actions & Activity */}
              <div className="space-y-4 md:space-y-5">
                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-2xl p-4 md:p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab("swap")}
                      className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-primary" />
                      <span className="text-sm text-white">Swap Tokens</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left">
                      <Plus className="w-4 h-4 text-primary" />
                      <span className="text-sm text-white">Add Token</span>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-[#12121a] border border-white/5 rounded-2xl p-4 md:p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="py-4 md:py-6 text-center">
                    <p className="text-sm text-white/30">No transactions yet</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className="w-full text-center text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    View All Activity
                  </button>
                </div>

                {/* Derived Wallets */}
                {wallets.length > 0 && (
                  <div className="bg-[#12121a] border border-white/5 rounded-2xl p-4 md:p-5">
                    <button
                      onClick={() => setShowWallets((prev) => !prev)}
                      className="w-full flex items-center justify-between text-sm"
                    >
                      <span className="font-semibold text-white">Derived Wallets</span>
                      <span className="flex items-center gap-2 text-white/40">
                        <span className="text-xs">{wallets.length}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${showWallets ? "rotate-180" : ""}`} />
                      </span>
                    </button>

                    {showWallets && (
                      <div className="mt-2 md:mt-4 space-y-2">
                        {wallets.map((wallet) => {
                          const isRevealed = revealedWallets[wallet.publicKey];
                          return (
                            <div
                              key={wallet.publicKey}
                              className="p-2.5 md:p-3 bg-[#16161e] rounded-xl"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-white">Wallet {wallet.index + 1}</p>
                                <button
                                  onClick={() => navigator.clipboard.writeText(wallet.publicKey)}
                                  className="text-[10px] text-white/40 hover:text-white"
                                >
                                  Copy
                                </button>
                              </div>
                              <p className="text-[10px] font-mono text-white/40">
                                {truncateAddress(wallet.publicKey)}
                              </p>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-[10px] text-white/30">Private Key</span>
                                <button
                                  onClick={() => toggleSecret(wallet.publicKey)}
                                  className="text-white/40 hover:text-white"
                                >
                                  {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                              </div>
                              {isRevealed && (
                                <p className="mt-1 text-[9px] font-mono text-white/30 break-all">
                                  {wallet.secretKey}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "tokens" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <TokenList onSend={() => setActiveTab("send")} />
            </motion.div>
          )}

          {activeTab === "swap" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SwapPanel />
            </motion.div>
          )}

          {activeTab === "send" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SendFlow />
            </motion.div>
          )}

          {activeTab === "activity" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ActivityList />
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SettingsPanel />
            </motion.div>
          )}
        </div>
      </main>
    </motion.div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
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
} from "lucide-react";
import { Button } from "./ui/button";
import { TokenList } from "@/components/TokenList";
import { SendFlow } from "@/components/SendFlow";
import { SwapPanel } from "@/components/SwapPanel";
import { ActivityList } from "@/components/ActivityList";
import { SettingsPanel } from "@/components/SettingsPanel";

export function Dashboard() {
  const { activeWallet, network, tokens, isInitialized } = useWalletContext();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [addressCopied, setAddressCopied] = useState(false);

  const solBalance = useMemo(
    () => tokens.find((token) => token.symbol === "SOL")?.balance ?? 0,
    [tokens],
  );
  const totalValue = useMemo(() => solBalance, [solBalance]);

  if (!isInitialized || !activeWallet) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(activeWallet.address);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Wallet Selector */}
        <div className="p-4 border-b border-sidebar-border">
          <button className="w-full bg-secondary rounded-lg p-3 hover:bg-secondary/80 transition-colors text-left">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{activeWallet.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {truncateAddress(activeWallet.address)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {solBalance.toFixed(4)} SOL
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 border-b border-border px-6 flex items-center justify-between">
          <button
            onClick={handleCopyAddress}
            className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <span className="font-mono text-sm">{truncateAddress(activeWallet.address)}</span>
            {addressCopied ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  network === "mainnet" ? "bg-primary" : "bg-yellow-500"
                }`}
              />
              <span className="text-sm text-muted-foreground capitalize">{network}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {activeTab === "dashboard" && (
            <div className="p-6 space-y-6 max-w-5xl">
              {/* Total Value */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                    <p className="text-4xl font-semibold tracking-tight">
                      ${totalValue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">USD</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* SOL Balance */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">◎</span>
                    </div>
                    <div>
                      <p className="font-medium">Solana</p>
                      <p className="text-sm text-muted-foreground">SOL</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg">{solBalance.toFixed(6)}</p>
                    <p className="text-sm text-muted-foreground">
                      ${totalValue.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveTab("send")}
                    className="ml-4 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Send
                  </Button>
                </div>
              </div>

              {/* Tokens */}
              <TokenList onSend={() => setActiveTab("send")} />
            </div>
          )}

          {activeTab === "tokens" && (
            <div className="p-6 max-w-5xl">
              <h2 className="text-xl font-semibold mb-6">Tokens</h2>
              <TokenList onSend={() => setActiveTab("send")} />
            </div>
          )}

          {activeTab === "swap" && (
            <div className="p-6">
              <SwapPanel />
            </div>
          )}

          {activeTab === "send" && (
            <div className="p-6">
              <SendFlow />
            </div>
          )}

          {activeTab === "activity" && (
            <div className="p-6 max-w-5xl">
              <h2 className="text-xl font-semibold mb-6">Activity</h2>
              <ActivityList />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="p-6">
              <SettingsPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

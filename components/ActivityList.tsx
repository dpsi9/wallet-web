"use client";

import React, { useState } from "react";
import { useWalletContext } from "@/contexts/WalletContext";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export function ActivityList() {
  const { transactions, isInitialized } = useWalletContext();
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-5 h-5" />;
      case 'receive':
        return <ArrowDownLeft className="w-5 h-5" />;
      case 'swap':
        return <ArrowLeftRight className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const truncateAddress = (addr?: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-4">
      {!isInitialized && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">Create or import a wallet to view activity</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {transactions.map((tx, index) => (
          <div key={tx.id}>
            <button
              onClick={() => setSelectedTx(selectedTx === tx.id ? null : tx.id)}
              className="w-full px-6 py-4 hover:bg-secondary/30 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'send' ? 'bg-destructive/10 text-destructive' :
                  tx.type === 'receive' ? 'bg-primary/10 text-primary' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  {getIcon(tx.type)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium capitalize">{tx.type}</span>
                    {getStatusIcon(tx.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono">{tx.id}</span>
                    {tx.address && (
                      <>
                        <span>•</span>
                        <span className="font-mono">{truncateAddress(tx.address)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount & Time */}
                <div className="text-right">
                  <p className={`font-mono ${
                    tx.type === 'receive' ? 'text-primary' :
                    tx.type === 'send' ? 'text-destructive' :
                    ''
                  }`}>
                    {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : ''}
                    {tx.amount} {tx.token}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatTimestamp(tx.timestamp)}
                  </p>
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {selectedTx === tx.id && (
              <div className="px-6 pb-4 space-y-3 border-t border-border pt-4 bg-secondary/20">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Transaction Hash</p>
                    <p className="font-mono text-xs break-all">{tx.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tx.status)}
                      <span className="capitalize">{tx.status}</span>
                    </div>
                  </div>
                  {tx.fee && (
                    <div>
                      <p className="text-muted-foreground mb-1">Network Fee</p>
                      <p className="font-mono">{tx.fee} SOL</p>
                    </div>
                  )}
                  {tx.address && (
                    <div>
                      <p className="text-muted-foreground mb-1">
                        {tx.type === 'send' ? 'Recipient' : 'Sender'}
                      </p>
                      <p className="font-mono text-xs break-all">{tx.address}</p>
                    </div>
                  )}
                </div>
                <button className="flex items-center gap-2 text-sm text-primary hover:underline">
                  View in Explorer
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            {index < transactions.length - 1 && <div className="border-b border-border" />}
          </div>
        ))}
      </div>

      {isInitialized && transactions.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">No transactions yet</p>
        </div>
      )}
    </div>
  );
}

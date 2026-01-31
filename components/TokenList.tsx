"use client";

import React, { useState } from "react";
import { useWalletContext } from "@/contexts/WalletContext";
import type { TokenData } from "@/types/tokenData";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp, Send } from "lucide-react";

interface TokenListProps {
  onSend: (tokenSymbol: string) => void;
}

export function TokenList({ onSend }: TokenListProps) {
  const { tokens, isInitialized } = useWalletContext();
  const [showUnverified, setShowUnverified] = useState(false);

  const verifiedTokens = tokens.filter((t: TokenData) => t.verified && t.symbol !== "SOL");
  const unverifiedTokens = tokens.filter((t: TokenData) => !t.verified);

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-6)}`;

  return (
    <div className="space-y-4">
      {isInitialized && tokens.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
          No token data available yet.
        </div>
      )}

      {!isInitialized && (
        <div className="bg-card border border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
          Create or import a wallet to view tokens.
        </div>
      )}

      {/* Verified Tokens Table */}
      {verifiedTokens.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm text-muted-foreground font-medium">Token</th>
                  <th className="text-right px-6 py-3 text-sm text-muted-foreground font-medium">Balance</th>
                  <th className="text-right px-6 py-3 text-sm text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifiedTokens.map((token, index) => (
                  <tr
                    key={token.mint}
                    className={`${index !== verifiedTokens.length - 1 ? "border-b border-border" : ""} hover:bg-secondary/30 transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground font-mono" title={token.mint}>
                          {truncateAddress(token.mint)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-mono">{token.balance.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSend(token.symbol)}
                        className="border-border hover:bg-secondary"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Send
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unverified Tokens */}
      {unverifiedTokens.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowUnverified(!showUnverified)}
            className="w-full flex items-center justify-between px-4 py-2 bg-card border border-border rounded-lg hover:bg-secondary/30 transition-colors"
          >
            <span className="text-sm text-muted-foreground">
              Unverified Tokens ({unverifiedTokens.length})
            </span>
            {showUnverified ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {showUnverified && (
            <div className="bg-card border border-border rounded-lg overflow-hidden opacity-60">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {unverifiedTokens.map((token, index) => (
                      <tr
                        key={token.mint}
                        className={`${index !== unverifiedTokens.length - 1 ? "border-b border-border" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-muted-foreground">{token.symbol}</p>
                            <p className="text-sm text-muted-foreground font-mono" title={token.mint}>
                              {truncateAddress(token.mint)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-mono text-muted-foreground">{token.balance.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled
                            className="text-muted-foreground"
                          >
                            Send
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

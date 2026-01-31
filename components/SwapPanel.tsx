"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useWalletContext } from "@/contexts/WalletContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowDown, ChevronDown, AlertTriangle } from "lucide-react";

export function SwapPanel() {
  const { tokens, isInitialized } = useWalletContext();
  const verifiedTokens = useMemo(() => tokens.filter((t) => t.verified), [tokens]);
  const [fromToken, setFromToken] = useState("SOL");
  const [toToken, setToToken] = useState("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [slippage, setSlippage] = useState("0.5");

  useEffect(() => {
    if (!verifiedTokens.find((t) => t.symbol === fromToken)) {
      setFromToken(verifiedTokens[0]?.symbol ?? "SOL");
    }
    if (!verifiedTokens.find((t) => t.symbol === toToken)) {
      setToToken(verifiedTokens[1]?.symbol ?? verifiedTokens[0]?.symbol ?? "USDC");
    }
  }, [verifiedTokens, fromToken, toToken]);

  const fromTokenData = verifiedTokens.find((t) => t.symbol === fromToken);
  const toTokenData = verifiedTokens.find((t) => t.symbol === toToken);

  // Mock exchange rate
  const rate =
    fromToken === "SOL" && toToken === "USDC"
      ? 98.45
      : fromToken === "USDC" && toToken === "SOL"
        ? 0.01016
        : 1.0;
               1.0;

  const fromAmountNum = parseFloat(fromAmount) || 0;
  const toAmount = (fromAmountNum * rate).toFixed(6);
  const priceImpact = fromAmountNum > 100 ? 2.3 : 0.1;
  const fee = 0.0001;

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount("");
  };

  const isHighImpact = priceImpact > 2;
  const canSwap = fromAmountNum > 0 && fromAmountNum <= (fromTokenData?.balance || 0);

  if (!isInitialized) {
    return (
      <div className="max-w-125 mx-auto space-y-6">
        <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
          Create or import a wallet to swap tokens.
        </div>
      </div>
    );
  }

  if (verifiedTokens.length === 0) {
    return (
      <div className="max-w-125 mx-auto space-y-6">
        <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
          No verified tokens available to swap.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-125 mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Swap</h2>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        {/* From */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">From</label>
            <span className="text-xs text-muted-foreground">
              Balance: {fromTokenData?.balance.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex gap-3">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-35 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {verifiedTokens.map((t) => (
                  <SelectItem key={t.symbol} value={t.symbol}>
                    {t.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 font-mono text-lg bg-secondary border-border"
            />
            <Button
              onClick={() => setFromAmount((fromTokenData?.balance || 0).toString())}
              variant="outline"
              className="border-border hover:bg-secondary"
            >
              Max
            </Button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2">
          <button
            onClick={handleSwapTokens}
            className="w-10 h-10 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors flex items-center justify-center"
          >
            <ArrowDown className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* To */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">To</label>
            <span className="text-xs text-muted-foreground">
              Balance: {toTokenData?.balance.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex gap-3">
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-35 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {verifiedTokens.map((t) => (
                  <SelectItem key={t.symbol} value={t.symbol}>
                    {t.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              value={toAmount}
              readOnly
              placeholder="0.00"
              className="flex-1 font-mono text-lg bg-secondary border-border text-muted-foreground"
            />
          </div>
        </div>

        {/* Details */}
        {fromAmountNum > 0 && (
          <div className="pt-4 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-mono">1 {fromToken} = {rate.toFixed(4)} {toToken}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price Impact</span>
              <span className={`font-mono ${isHighImpact ? 'text-destructive' : ''}`}>
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network Fee</span>
              <span className="font-mono">{fee} SOL</span>
            </div>
            
            {/* Advanced Settings */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
            >
              <span>Advanced Settings</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
            
            {showAdvanced && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">Slippage Tolerance</label>
                  <div className="flex gap-2">
                    {["0.1", "0.5", "1.0"].map((val) => (
                      <button
                        key={val}
                        onClick={() => setSlippage(val)}
                        className={`px-3 py-1 text-xs rounded ${
                          slippage === val
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                    <Input
                      type="number"
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                      className="w-16 h-7 text-xs font-mono bg-secondary border-border"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Warning for high impact */}
      {isHighImpact && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <div className="text-sm text-destructive">
            High price impact detected. Consider reducing the swap amount.
          </div>
        </div>
      )}

      {/* Swap Button */}
      <Button
        disabled={!canSwap}
        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {!fromAmountNum ? 'Enter Amount' : !canSwap ? 'Insufficient Balance' : 'Swap'}
      </Button>
    </div>
  );
}

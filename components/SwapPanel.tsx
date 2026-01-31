"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useWalletContext } from "@/contexts/WalletContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowDown, ChevronDown, AlertTriangle, Loader2, Check, Plus } from "lucide-react";

// Popular tokens with their mint addresses
const POPULAR_TOKENS: { symbol: string; name: string; mint: string; decimals: number }[] = [
  { symbol: "SOL", name: "Solana", mint: "So11111111111111111111111111111111111111112", decimals: 9 },
  { symbol: "USDC", name: "USD Coin", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
  { symbol: "USDT", name: "Tether", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6 },
  { symbol: "BONK", name: "Bonk", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5 },
  { symbol: "JUP", name: "Jupiter", mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", decimals: 6 },
  { symbol: "RAY", name: "Raydium", mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", decimals: 6 },
  { symbol: "WIF", name: "dogwifhat", mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", decimals: 6 },
  { symbol: "PYTH", name: "Pyth Network", mint: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3", decimals: 6 },
];

// Create a lookup map for token mints
const TOKEN_MINTS: Record<string, string> = Object.fromEntries(
  POPULAR_TOKENS.map(t => [t.symbol, t.mint])
);

export function SwapPanel() {
  const { tokens, isInitialized, swapTokens } = useWalletContext();
  const verifiedTokens = useMemo(() => tokens.filter((t) => t.verified), [tokens]);
  
  // Combine user's tokens with popular tokens (avoid duplicates)
  const allTokenOptions = useMemo(() => {
    const userSymbols = new Set(verifiedTokens.map(t => t.symbol));
    const popularNotOwned = POPULAR_TOKENS.filter(t => !userSymbols.has(t.symbol));
    return [
      ...verifiedTokens.map(t => ({ ...t, owned: true })),
      ...popularNotOwned.map(t => ({ ...t, balance: 0, verified: true, owned: false })),
    ];
  }, [verifiedTokens]);

  const [fromToken, setFromToken] = useState("SOL");
  const [toToken, setToToken] = useState("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  
  // Custom mint address state
  const [showCustomMint, setShowCustomMint] = useState(false);
  const [customMintAddress, setCustomMintAddress] = useState("");
  const [customMintFor, setCustomMintFor] = useState<"from" | "to">("to");

  const fromTokenData = allTokenOptions.find((t) => t.symbol === fromToken) || 
    (fromToken === "CUSTOM" ? { symbol: "CUSTOM", name: "Custom Token", mint: customMintAddress, decimals: 9, balance: 0 } : null);
  const toTokenData = allTokenOptions.find((t) => t.symbol === toToken) ||
    (toToken === "CUSTOM" ? { symbol: "CUSTOM", name: "Custom Token", mint: customMintAddress, decimals: 9, balance: 0 } : null);

  // Mock exchange rate
  const rate =
    fromToken === "SOL" && toToken === "USDC"
      ? 98.45
      : fromToken === "USDC" && toToken === "SOL"
        ? 0.01016
        : 1.0;

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

  const handleSwap = async () => {
    setIsSwapping(true);
    setSwapError(null);
    setSwapSuccess(false);

    try {
      let inputMint = TOKEN_MINTS[fromToken] || fromTokenData?.mint;
      let outputMint = TOKEN_MINTS[toToken] || toTokenData?.mint;

      // Handle custom mint
      if (fromToken === "CUSTOM" && customMintFor === "from") {
        inputMint = customMintAddress;
      }
      if (toToken === "CUSTOM" && customMintFor === "to") {
        outputMint = customMintAddress;
      }

      if (!inputMint || !outputMint) {
        throw new Error("Invalid token selection");
      }

      if (inputMint === outputMint) {
        throw new Error("Cannot swap same token");
      }

      // Convert amount to smallest unit (for SOL, multiply by 1e9, for USDC multiply by 1e6)
      const decimals = fromTokenData?.decimals || 9;
      const amountInSmallestUnit = Math.floor(fromAmountNum * Math.pow(10, decimals));

      await swapTokens(inputMint, outputMint, amountInSmallestUnit);
      setSwapSuccess(true);
      setFromAmount("");
      
      // Reset success message after 5 seconds
      setTimeout(() => setSwapSuccess(false), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Swap failed";
      setSwapError(errorMessage);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleAddCustomMint = (target: "from" | "to") => {
    setCustomMintFor(target);
    setShowCustomMint(true);
  };

  const confirmCustomMint = () => {
    if (customMintAddress.length >= 32) {
      if (customMintFor === "from") {
        setFromToken("CUSTOM");
      } else {
        setToToken("CUSTOM");
      }
      setShowCustomMint(false);
    }
  };

  const isHighImpact = priceImpact > 2;
  const hasBalance = fromToken === "CUSTOM" || fromAmountNum <= (fromTokenData?.balance || 0);
  const canSwap = fromAmountNum > 0 && hasBalance && fromToken !== toToken;

  if (!isInitialized) {
    return (
      <motion.div
        className="max-w-full sm:max-w-lg mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 text-center text-muted-foreground">
          Create or import a wallet to swap tokens.
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-full sm:max-w-lg mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg sm:text-xl font-semibold">Swap</h2>

      <motion.div
        className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.25 }}
      >
        {/* Custom Mint Modal */}
        {showCustomMint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md space-y-4">
              <h3 className="text-lg font-semibold">Enter Token Mint Address</h3>
              <p className="text-sm text-muted-foreground">
                Paste the Solana token mint address you want to swap {customMintFor === "from" ? "from" : "to"}.
              </p>
              <Input
                value={customMintAddress}
                onChange={(e) => setCustomMintAddress(e.target.value)}
                placeholder="Token mint address (e.g., EPjFWdd5...)"
                className="font-mono text-sm bg-secondary border-border"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowCustomMint(false)}
                  variant="outline"
                  className="flex-1 border-border"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmCustomMint}
                  disabled={customMintAddress.length < 32}
                  className="flex-1"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* From */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">From</label>
            <span className="text-xs text-muted-foreground">
              Balance: {fromTokenData?.balance?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex gap-3">
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-35 bg-secondary border-border">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">Your Tokens</div>
                {verifiedTokens.map((t) => (
                  <SelectItem key={t.symbol} value={t.symbol}>
                    <span className="flex items-center gap-2">
                      {t.symbol}
                      <span className="text-xs text-muted-foreground">({t.balance.toFixed(2)})</span>
                    </span>
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium border-t border-border mt-1 pt-2">Popular Tokens</div>
                {POPULAR_TOKENS.filter(t => !verifiedTokens.find(v => v.symbol === t.symbol)).map((t) => (
                  <SelectItem key={t.symbol} value={t.symbol}>
                    {t.symbol}
                  </SelectItem>
                ))}
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddCustomMint("from");
                    }}
                    className="w-full px-2 py-1.5 text-sm text-left hover:bg-secondary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Custom Token
                  </button>
                </div>
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
          {fromToken === "CUSTOM" && (
            <p className="text-xs text-muted-foreground font-mono truncate">
              Mint: {customMintAddress}
            </p>
          )}
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
              Balance: {toTokenData?.balance?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex gap-3">
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-35 bg-secondary border-border">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">Your Tokens</div>
                {verifiedTokens.map((t) => (
                  <SelectItem key={t.symbol} value={t.symbol}>
                    <span className="flex items-center gap-2">
                      {t.symbol}
                      <span className="text-xs text-muted-foreground">({t.balance.toFixed(2)})</span>
                    </span>
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium border-t border-border mt-1 pt-2">Popular Tokens</div>
                {POPULAR_TOKENS.filter(t => !verifiedTokens.find(v => v.symbol === t.symbol)).map((t) => (
                  <SelectItem key={t.symbol} value={t.symbol}>
                    {t.symbol}
                  </SelectItem>
                ))}
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddCustomMint("to");
                    }}
                    className="w-full px-2 py-1.5 text-sm text-left hover:bg-secondary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Custom Token
                  </button>
                </div>
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
          {toToken === "CUSTOM" && (
            <p className="text-xs text-muted-foreground font-mono truncate">
              Mint: {customMintAddress}
            </p>
          )}
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
      </motion.div>

      {/* Warning for high impact */}
      {isHighImpact && (
        <motion.div
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <div className="text-sm text-destructive">
            High price impact detected. Consider reducing the swap amount.
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {swapError && (
        <motion.div
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {swapError}
        </motion.div>
      )}

      {/* Success Message */}
      {swapSuccess && (
        <motion.div
          className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Check className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-500">Swap completed successfully!</span>
        </motion.div>
      )}

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={!canSwap || isSwapping}
        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSwapping ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Swapping...
          </>
        ) : !fromAmountNum ? (
          'Enter Amount'
        ) : !canSwap ? (
          'Insufficient Balance'
        ) : (
          'Swap'
        )}
      </Button>
    </motion.div>
  );
}

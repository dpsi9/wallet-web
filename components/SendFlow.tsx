"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useWalletContext } from "@/contexts/WalletContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export function SendFlow() {
  const { activeWallet, tokens, isInitialized, sendTransaction, network } = useWalletContext();
  const [step, setStep] = useState<"recipient" | "amount" | "review" | "success">("recipient");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const verifiedTokens = useMemo(() => tokens.filter((t) => t.verified), [tokens]);
  const defaultToken = verifiedTokens[0]?.symbol ?? "SOL";
  const [selectedToken, setSelectedToken] = useState(defaultToken);
  const [slideProgress, setSlideProgress] = useState(0);
  const [txHash, setTxHash] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!verifiedTokens.find((t) => t.symbol === selectedToken)) {
      setSelectedToken(defaultToken);
    }
  }, [verifiedTokens, selectedToken, defaultToken]);

  if (!isInitialized) {
    return (
      <motion.div
        className="max-w-150 mx-auto space-y-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
          Create or import a wallet to send tokens.
        </div>
      </motion.div>
    );
  }

  if (!activeWallet || verifiedTokens.length === 0) {
    return (
      <motion.div
        className="max-w-150 mx-auto space-y-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
          No verified tokens available to send.
        </div>
      </motion.div>
    );
  }

  const token = verifiedTokens.find((t) => t.symbol === selectedToken) || verifiedTokens[0];
  const fee = 0.000005;
  const amountNum = parseFloat(amount) || 0;
  const balanceAfter = token.balance - amountNum - (selectedToken === 'SOL' ? fee : 0);

  const handleSlideToSend = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const startX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX;
      const distance = currentX - startX;
      const maxDistance = rect.width - 60;
      const progress = Math.max(0, Math.min(100, (distance / maxDistance) * 100));
      setSlideProgress(progress);

      if (progress >= 100) {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        handleSendTransaction();
      }
    };

    const handleMouseUp = () => {
      setSlideProgress(0);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleSendTransaction = async () => {
    if (selectedToken !== 'SOL') {
      setSendError('Only SOL transfers are currently supported');
      setSlideProgress(0);
      return;
    }

    setIsSending(true);
    setSendError(null);
    
    try {
      const amountNum = parseFloat(amount);
      const amountLamports = BigInt(Math.floor(amountNum * 1e9));
      
      const signature = await sendTransaction(recipient, amountLamports);
      setTxHash(signature);
      setStep('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setSendError(errorMessage);
      setSlideProgress(0);
    } finally {
      setIsSending(false);
    }
  };

  const isValidAddress = recipient.length >= 32;

  return (
    <motion.div
      className="max-w-150 mx-auto space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold">Send {selectedToken}</h2>

      {step === 'recipient' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Recipient Address</label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter Solana address"
                className="font-mono bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter a valid Solana address or domain name
              </p>
            </div>
          </div>

          <Button
            onClick={() => setStep('amount')}
            disabled={!isValidAddress}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}

      {step === 'amount' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Token</label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.filter(t => t.verified).map(t => (
                    <SelectItem key={t.symbol} value={t.symbol}>
                      {t.symbol} - {t.balance.toLocaleString()} available
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Amount</label>
                <button
                  onClick={() => setAmount((token.balance - (selectedToken === 'SOL' ? fee : 0)).toString())}
                  className="text-sm text-primary hover:underline"
                >
                  Max
                </button>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="font-mono text-lg bg-secondary border-border pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {selectedToken}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Available: {token.balance.toLocaleString()} {selectedToken}
              </p>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="font-mono">{fee} SOL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance After</span>
                <span className="font-mono">{balanceAfter.toFixed(6)} {selectedToken}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setStep('recipient')}
              variant="outline"
              className="flex-1 h-12 border-border hover:bg-secondary"
            >
              Back
            </Button>
            <Button
              onClick={() => setStep('review')}
              disabled={!amount || amountNum <= 0 || amountNum > token.balance}
              className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}

      {step === 'review' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Network</p>
              <p className="font-medium">Solana {network === 'devnet' ? 'Devnet' : 'Mainnet'}</p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-1">Recipient</p>
              <p className="font-mono text-sm break-all">{recipient}</p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-1">Amount</p>
              <p className="font-mono text-2xl">{amount} {selectedToken}</p>
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="font-mono">{fee} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Final Balance</span>
                <span className="font-mono">{balanceAfter.toFixed(6)} {selectedToken}</span>
              </div>
            </div>
          </div>

          {sendError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
              {sendError}
            </div>
          )}

          <div className="bg-card border border-border rounded-lg p-4">
            {isSending ? (
              <div className="flex items-center justify-center h-14 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">Sending transaction...</span>
              </div>
            ) : (
              <>
                <button
                  onMouseDown={handleSlideToSend}
                  className="relative w-full h-14 bg-secondary rounded-lg overflow-hidden"
                  disabled={isSending}
                >
                  <div
                    className="absolute inset-0 bg-primary transition-all"
                    style={{ width: `${slideProgress}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {slideProgress < 100 ? 'Slide to Send →' : 'Sending...'}
                    </span>
                  </div>
                </button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Slide to confirm transaction
                </p>
              </>
            )}
          </div>

          <Button
            onClick={() => {
              setStep('amount');
              setSendError(null);
            }}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            disabled={isSending}
          >
            Cancel
          </Button>
        </motion.div>
      )}

      {step === 'success' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Transaction Sent</h3>
              <p className="text-muted-foreground">Your transaction has been submitted to the network</p>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Transaction Hash</p>
              <p className="font-mono text-xs break-all bg-secondary px-3 py-2 rounded">
                {txHash}
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              setStep('recipient');
              setRecipient('');
              setAmount('');
              setSlideProgress(0);
              setSendError(null);
            }}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Send Another Transaction
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

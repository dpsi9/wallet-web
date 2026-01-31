"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { useWalletContext } from "@/contexts/WalletContext";
import { AlertCircle, Eye, EyeOff, Copy, Check } from "lucide-react";

interface SeedPhraseProps {
  mode: 'create' | 'import';
}

export function SeedPhrase({ mode }: SeedPhraseProps) {
  const { createNewWallet, recoverWallet, setCurrentView } = useWalletContext();
  const [revealed, setRevealed] = useState(mode === 'import');
  const [confirmed, setConfirmed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [importPhrase, setImportPhrase] = useState('');

  // Generate mock seed phrase for creation
  const words = mode === 'create' ? [
    'abandon', 'ability', 'able', 'about', 'above', 'absent',
    'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'
  ] : [];

  const handleReveal = () => {
    let interval: NodeJS.Timeout;
    const startTime = Date.now();
    const duration = 2000;

    interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        setRevealed(true);
        clearInterval(interval);
        setHoldProgress(0);
      }
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      setHoldProgress(0);
    }, duration + 100);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(words.join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    if (mode === 'create') {
      createNewWallet();
      setCurrentView('dashboard');
    } else {
      recoverWallet(importPhrase);
      setCurrentView('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-150 space-y-6">
        {/* Warning */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-destructive font-medium mb-1">Critical Security Information</p>
            <p className="text-destructive/80">
              Anyone with this phrase owns your funds. Never share it. Write it down offline.
            </p>
          </div>
        </div>

        {mode === 'create' ? (
          <>
            {/* Seed Phrase Grid */}
            <div className="bg-card border border-border rounded-lg p-6">
              {!revealed ? (
                <div className="text-center py-12 space-y-4">
                  <div className="flex justify-center">
                    <EyeOff className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Your recovery phrase is hidden. Hold the button below to reveal.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {words.map((word, index) => (
                    <div
                      key={index}
                      className="bg-secondary border border-border rounded px-3 py-2 font-mono text-sm"
                    >
                      <span className="text-muted-foreground mr-2">{index + 1}.</span>
                      <span className="text-foreground">{word}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {!revealed ? (
                <Button
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 relative overflow-hidden"
                  onMouseDown={handleReveal}
                  onMouseUp={() => setHoldProgress(0)}
                  onMouseLeave={() => setHoldProgress(0)}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Hold to Reveal Phrase
                  </span>
                  <div
                    className="absolute inset-0 bg-primary/50 transition-all"
                    style={{ width: `${holdProgress}%` }}
                  />
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="w-full h-12 border-border hover:bg-secondary"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                  <div className="flex items-start gap-2 p-3">
                    <input
                      type="checkbox"
                      id="confirmed"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-1 accent-primary"
                    />
                    <label htmlFor="confirmed" className="text-sm text-muted-foreground cursor-pointer">
                      I've written down my recovery phrase and stored it securely
                    </label>
                  </div>
                  <Button
                    onClick={handleContinue}
                    disabled={!confirmed}
                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </Button>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Import Area */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Enter your 12 or 24 word recovery phrase
                </label>
                <textarea
                  value={importPhrase}
                  onChange={(e) => setImportPhrase(e.target.value)}
                  placeholder="word1 word2 word3..."
                  className="w-full h-32 bg-secondary border border-border rounded px-3 py-2 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleContinue}
                disabled={importPhrase.split(' ').filter(w => w).length < 12}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Wallet
              </Button>
              <Button
                onClick={() => setCurrentView('landing')}
                variant="outline"
                className="w-full h-12 border-border hover:bg-secondary"
              >
                Cancel
              </Button>
            </div>
          </>
        )}

        {mode === 'create' && (
          <Button
            onClick={() => setCurrentView('landing')}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

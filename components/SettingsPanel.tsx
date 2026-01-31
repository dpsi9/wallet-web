"use client";

import React, { useState } from "react";
import { useWalletContext } from "@/contexts/WalletContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Lock, EyeOff, AlertCircle } from "lucide-react";

export function SettingsPanel() {
  const { network, setNetwork, activeWallet } = useWalletContext();
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [confirmExport, setConfirmExport] = useState(false);
  const [rpcUrl, setRpcUrl] = useState('https://api.mainnet-beta.solana.com');
  const [simulationEnabled, setSimulationEnabled] = useState(true);
  const [currency, setCurrency] = useState('USD');

  const handleExportSeed = () => {
    if (!confirmExport) {
      setConfirmExport(true);
      setTimeout(() => setConfirmExport(false), 5000);
    } else {
      setShowSeedPhrase(true);
    }
  };

  return (
    <div className="max-w-200 mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>

      {/* Security Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <h3 className="font-medium flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Security
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Lock Wallet</label>
            <Button variant="outline" className="border-border hover:bg-secondary">
              Lock Now
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Lock your wallet to require authentication
            </p>
          </div>

          <div className="border-t border-border pt-4">
            <label className="text-sm text-muted-foreground mb-2 block">Export Seed Phrase</label>
            <div className="space-y-3">
              {!showSeedPhrase ? (
                <>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive">
                      Never share your seed phrase. Anyone with access can steal your funds.
                    </p>
                  </div>
                  <Button
                    onClick={handleExportSeed}
                    variant="outline"
                    className={`border-border hover:bg-secondary ${
                      confirmExport ? 'border-destructive text-destructive' : ''
                    }`}
                  >
                    {confirmExport ? 'Click Again to Confirm' : 'Show Seed Phrase'}
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="bg-secondary border border-border rounded-lg p-4">
                    <p className="font-mono text-sm break-all">
                      {activeWallet?.seedPhrase || 'No seed phrase available'}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowSeedPhrase(false)}
                    variant="outline"
                    className="border-border hover:bg-secondary"
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide Seed Phrase
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Network Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-medium">Network</h3>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Active Network</label>
          <Select value={network} onValueChange={(value: 'mainnet' | 'devnet') => setNetwork(value)}>
            <SelectTrigger className="w-full bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mainnet">Solana Mainnet</SelectItem>
              <SelectItem value="devnet">Solana Devnet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-medium">Appearance</h3>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Theme</label>
          <Select value="dark" disabled>
            <SelectTrigger className="w-full bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            Dark mode only
          </p>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Fiat Currency</label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-full bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="JPY">JPY (¥)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-medium">Advanced</h3>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Custom RPC Endpoint</label>
          <Input
            value={rpcUrl}
            onChange={(e) => setRpcUrl(e.target.value)}
            placeholder="https://api.mainnet-beta.solana.com"
            className="font-mono bg-secondary border-border"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Override the default RPC endpoint
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <label className="text-sm font-medium">Transaction Simulation</label>
            <p className="text-xs text-muted-foreground mt-1">
              Simulate transactions before sending
            </p>
          </div>
          <Switch
            checked={simulationEnabled}
            onCheckedChange={setSimulationEnabled}
          />
        </div>
      </div>

      {/* App Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Build</span>
            <span className="font-mono">20260128</span>
          </div>
        </div>
      </div>
    </div>
  );
}

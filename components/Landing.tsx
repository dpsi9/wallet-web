"use client";

import { Button } from "./ui/button";
import { useWalletContext } from "@/contexts/WalletContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Wallet } from "lucide-react";

export function Landing() {
  const { setCurrentView, network, setNetwork } = useWalletContext();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-105 space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-card border-2 border-primary rounded-lg flex items-center justify-center">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => setCurrentView('create')}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create New Wallet
          </Button>
          <Button
            onClick={() => setCurrentView('import')}
            variant="outline"
            className="w-full h-12 border-border hover:bg-secondary"
          >
            Import Existing Wallet
          </Button>
        </div>

        {/* Network Selector */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Network</span>
            <Select value={network} onValueChange={(value: 'mainnet' | 'devnet') => setNetwork(value)}>
              <SelectTrigger className="w-35 h-9 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mainnet">Mainnet</SelectItem>
                <SelectItem value="devnet">Devnet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

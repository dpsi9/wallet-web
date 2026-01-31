"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { useWalletContext } from "@/contexts/WalletContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Wallet, Sparkles, ShieldCheck } from "lucide-react";

export function Landing() {
  const { setCurrentView, network, setNetwork } = useWalletContext();

  return (
    <motion.div
      className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-10 top-20 h-48 w-48 rounded-full bg-primary/5 blur-2xl" />
        <div className="absolute left-10 bottom-16 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
      </div>
      <motion.div
        className="w-full max-w-2xl relative"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="rounded-3xl border border-border bg-card/70 p-10 shadow-[0_30px_120px_-50px_rgba(0,0,0,0.9)] backdrop-blur">
          {/* Logo + Title */}
          <motion.div
            className="flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background/60 shadow-[0_0_0_1px_rgba(0,255,255,0.12)]"
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Wallet className="h-7 w-7 text-primary" />
            </motion.div>
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-wide">Welcome to PocketWallet</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                A calm, secure Solana wallet experience
              </p>
            </div>
          </motion.div>

          <motion.div
            className="mt-8 space-y-4"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Button
              onClick={() => setCurrentView('create')}
              className="w-full h-13 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_16px_40px_-20px_rgba(0,255,255,0.9)]"
            >
              Create New Wallet
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => setCurrentView('import')}
              variant="outline"
              className="w-full h-12 border-border hover:bg-secondary/70"
            >
              Import Existing Wallet
            </Button>
          </motion.div>

          <motion.div
            className="mt-7 flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Network</span>
            </div>
            <Select value={network} onValueChange={(value: 'mainnet' | 'devnet') => setNetwork(value)}>
              <SelectTrigger className="w-35 h-9 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mainnet">Mainnet</SelectItem>
                <SelectItem value="devnet">Devnet</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Secured with client-side key generation</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

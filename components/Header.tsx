"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

export function Header() {
  return (
    <motion.header
      className="w-full border-b border-border bg-background/80 backdrop-blur"
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
        >
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card shadow-[0_0_0_1px_rgba(0,255,255,0.15)]"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <Wallet className="h-5 w-5 text-primary" />
          </motion.div>
          <div>
            <motion.span
              className="text-sm font-semibold tracking-wide text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.25 }}
            >
              PocketWallet
            </motion.span>
            <motion.div
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.25 }}
            >
              Secure Solana vault
            </motion.div>
          </div>
        </motion.div>
        <motion.div
          className="flex items-center gap-3 text-xs text-muted-foreground"
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
        >
          <span className="hidden sm:inline">Docs</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          <span>v1.0</span>
        </motion.div>
      </div>
    </motion.header>
  );
}

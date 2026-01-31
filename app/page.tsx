"use client";

import { useWalletContext } from "@/contexts/WalletContext";
import { Dashboard } from "@/components/Dashboard";
import { Landing } from "@/components/Landing";
import { SeedPhrase } from "@/components/SeedPhrase";
import { Header } from "@/components/Header";

export default function Home() {
  const { currentView } = useWalletContext();

  // Dashboard has its own integrated header in the sidebar - don't show separate header
  const showHeader = currentView !== "dashboard";

  return (
    <div className="dark">
      {showHeader && <Header />}
      {currentView === "landing" && <Landing />}
      {currentView === "create" && <SeedPhrase mode="create" />}
      {currentView === "import" && <SeedPhrase mode="import" />}
      {currentView === "dashboard" && <Dashboard />}
    </div>
  );
}

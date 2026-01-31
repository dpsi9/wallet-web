import {
  Rpc,
  SolanaRpcApi,
  RpcSubscriptions,
  SolanaRpcSubscriptionsApi,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
} from "@solana/kit";

export type Network = "mainnet" | "devnet";

export type Client = {
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  network: Network;
};

const clients: Map<Network, Client> = new Map();

function getRpcUrls(network: Network): { rpcUrl: string; rpcSubscriptionUrl: string } {
  if (network === "devnet") {
    return {
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL_DEVNET || process.env.RPC_URL_DEVNET!,
      rpcSubscriptionUrl: process.env.NEXT_PUBLIC_RPC_SUBSCRIPTION_URL_DEVNET || process.env.RPC_SUBSCRIPTION_URL_DEVNET!,
    };
  }
  return {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || process.env.RPC_URL!,
    rpcSubscriptionUrl: process.env.NEXT_PUBLIC_RPC_SUBSCRIPTION_URL || process.env.RPC_SUBSCRIPTION_URL!,
  };
}

export function createClient(network: Network = "mainnet"): Client {
  const existing = clients.get(network);
  if (existing) {
    return existing;
  }

  const { rpcUrl, rpcSubscriptionUrl } = getRpcUrls(network);
  
  const client: Client = {
    rpc: createSolanaRpc(rpcUrl),
    rpcSubscriptions: createSolanaRpcSubscriptions(rpcSubscriptionUrl),
    network,
  };
  
  clients.set(network, client);
  return client;
}

// Clear cached client for a network (useful when switching networks)
export function clearClient(network?: Network): void {
  if (network) {
    clients.delete(network);
  } else {
    clients.clear();
  }
}

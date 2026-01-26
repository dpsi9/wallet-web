import {
  Rpc,
  RpcSubscriptions,
  SolanaRpcApi,
  SolanaRpcSubscriptionsApi,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
} from "@solana/kit";

export type Client = {
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
};

let client: Client | undefined;
export function createClient(): Client {
  if (!client) {
    client = {
      rpc: createSolanaRpc(process.env.RPC_URL!),
      rpcSubscriptions: createSolanaRpcSubscriptions(process.env.RPC_SUBSCRIPTION_URL!),
    };
  }
  return client;
}

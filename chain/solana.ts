import { createSolanaRpc, createSolanaRpcSubscriptions, Address } from "@solana/kit";
import axios from "axios";
// functions = getSolBalance, getTokenBalance(usdc,etc), sendSoltosomeone, swapSolfor other

export const rpc = createSolanaRpc(process.env.RPC_URL!);
export const rpcSubscriptions = createSolanaRpcSubscriptions(process.env.RPC_SUBSCRIPTION_URL!);

const LAMPORTS_PER_SOL = 1_000_000_000;

export async function getSolBalance(account: Address): Promise<number> {
  const { value: balance } = await rpc.getBalance(account).send();
  return balance > 0 ? Number(balance) / LAMPORTS_PER_SOL : 0;
}

export async function getTokenAccounts(publicKey: Address): Promise<any> {
  const { data } = await axios.post(
    process.env.RPC_URL!,
    {
      jsonrpc: "2.0",
      id: "1",
      method: "getTokenAccounts",
      params: { owner: publicKey },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  //   console.log(data.result.token_accounts)

  return data.result.token_accounts;
}

export async function getTokensInfo(publicKey: Address) {
  const { data } = await axios.post(process.env.RPC_URL!, {
    jsonrpc: "2.0",
    id: "1",
    method: "getAssetsByOwner",
    params: {
      ownerAddress: publicKey,
      options: {
        showUnverifiedCollections: false,
        showCollectionMetadata: false,
        showGrandTotal: false,
        showFungible: false,
        showNativeBalance: false,
        showInscription: false,
        showZeroBalance: false,
      },
    },
  });

  
}

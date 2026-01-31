import { Address } from "@solana/kit";
import axios from "axios";
import { classifyToken } from "./tokenFilter";
import { TokenData } from "@/types/tokenData";
import type { Network } from "./client";

function getRpcUrl(network: Network): string {
  if (network === "devnet") {
    return process.env.NEXT_PUBLIC_RPC_URL_DEVNET || process.env.RPC_URL_DEVNET!;
  }
  return process.env.NEXT_PUBLIC_RPC_URL || process.env.RPC_URL!;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getUserAssets(
  publicKey: Address,
  network: Network = "mainnet",
  retries: number = 3,
): Promise<{ trusted: TokenData[]; untrusted: TokenData[] }> {
  console.log(publicKey);
  const rpcUrl = getRpcUrl(network);
  
  try {
    const { data } = await axios.post(
      rpcUrl,
      {
        jsonrpc: "2.0",
        id: "1",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: publicKey,
          options: {
            showUnverifiedCollections: false,
            showCollectionMetadata: false,
            showGrandTotal: false,
            showFungible: true,
            showNativeBalance: false,
            showInscription: false,
            showZeroBalance: false,
          },
          limit: 50,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const assets = data.result.items as any[];

    const trusted = [];
    const untrusted = [];

    for (const asset of assets) {
      const token = await classifyToken(asset, network);
      if (!token) continue;

      if (token.verified) trusted.push(token);
      else untrusted.push(token);
    }

    return { trusted, untrusted };
  } catch (error: any) {
    // Handle rate limiting (429) with retry
    if (error?.response?.status === 429 && retries > 0) {
      const delay = (4 - retries) * 1500; // 1.5s, 3s, 4.5s
      console.log(`Rate limited, retrying in ${delay}ms... (${retries} retries left)`);
      await sleep(delay);
      return getUserAssets(publicKey, network, retries - 1);
    }
    
    // Re-throw with better message for rate limiting
    if (error?.response?.status === 429) {
      throw new Error("Rate limited by RPC. Please wait a moment and try again.");
    }
    
    throw error;
  }
}

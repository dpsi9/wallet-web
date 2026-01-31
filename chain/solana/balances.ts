import { Address } from "@solana/kit";
import { createClient, type Network } from "./client";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getBalance(account: Address, network: Network = "mainnet", retries = 3): Promise<number> {
  const client = createClient(network);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { value: balance } = await client.rpc.getBalance(account).send();
      return balance > 0 ? Number(balance) : 0;
    } catch (err: any) {
      const isRateLimit = err?.message?.includes("429") || err?.context?.statusCode === 429;
      
      if (isRateLimit && attempt < retries) {
        // Exponential backoff: 1s, 2s, 4s
        const waitTime = Math.pow(2, attempt - 1) * 1000;
        console.warn(`Rate limited, retrying in ${waitTime}ms... (attempt ${attempt}/${retries})`);
        await delay(waitTime);
        continue;
      }
      
      throw err;
    }
  }
  
  return 0;
}

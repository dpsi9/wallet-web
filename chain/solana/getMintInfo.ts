import { fetchMint } from "@solana-program/token-2022";
import { createClient } from "./client"
import { Address } from "@solana/kit";

const MINT_CACHE = new Map<string, any>();

export async function getMintInfo(mint: string) {
  if (MINT_CACHE.has(mint)) return MINT_CACHE.get(mint);

  const {rpc, rpcSubscriptions} = createClient();

  const mintPk = mint as Address;
  const mintInfo = await fetchMint(rpc, mintPk);

  MINT_CACHE.set(mint, mintInfo);

  return mintInfo;
}

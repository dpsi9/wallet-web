import { fetchMint } from "@solana-program/token-2022";
import { createClient, type Network } from "./client"
import { Address } from "@solana/kit";

const MINT_CACHE = new Map<string, any>();

export async function getMintInfo(mint: string, network: Network = "mainnet") {
  const cacheKey = `${network}:${mint}`;
  if (MINT_CACHE.has(cacheKey)) return MINT_CACHE.get(cacheKey);

  const { rpc } = createClient(network);

  const mintPk = mint as Address;
  const mintInfo = await fetchMint(rpc, mintPk);

  MINT_CACHE.set(cacheKey, mintInfo);

  return mintInfo;
}

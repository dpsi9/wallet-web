import { TokenData } from "@/types/tokenData";
import { getMintInfo } from "./getMintInfo";

export async function classifyToken(asset: any) {
  if (asset.interface !== "FungibleToken") return null;
  const info = asset.token_info;
  const meta = asset.content?.metadata;

  if (!info || !meta?.name || !meta?.symbol) return null;
  if (info.decimals > 18) return null;

  const balance = info.balance / 10 ** info.decimals;
  if (balance < 0.0001) return null;

  const text = `${meta.name} ${meta.symbol}`.toLowerCase();
  const banned = ["http", "visit", "claim", "airdrop", "free"];

  if (banned.some((w) => text.includes(w))) return null;

  const mintInfo = await getMintInfo(asset.id);

  const hasMintAuthority = mintInfo.mintAuthority !== null;
  const hasFreezeAuthority = mintInfo.freezeAuthority != null;

  const trusted = !hasFreezeAuthority && !hasMintAuthority;

  return {
    mint: asset.id,
    name: meta.name,
    symbol: meta.symbol,
    balance,
    decimals: info.decimals,
    verified: trusted,
  };
}

import { rpc, rpcSubscriptions } from "@/chain/solana";
import { Address } from "@solana/kit";
import axios from "axios";
import { classifyToken } from "./tokenFilter";

export async function getUserAssets(publicKey: Address) {
  console.log(publicKey)
  const { data } = await axios.post(
    process.env.RPC_URL!,
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
    const token = await classifyToken(asset);
    if (!token) continue;

    if (token.verified) trusted.push(token);
    else untrusted.push(token);
  }

  return { trusted, untrusted };
}

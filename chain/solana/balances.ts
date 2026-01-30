import { Address } from "@solana/kit";
import { createClient } from "./client";

export async function getBalance(account: Address) {
  let client = createClient();
  const { value: balance } = await client.rpc.getBalance(account).send();

  return balance > 0 ? Number(balance) : 0;
}

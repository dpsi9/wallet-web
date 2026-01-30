import { getUserAssets } from "@/chain/solana/getUserAssets";
import { getBalance } from "@/chain/solana/balances";
import { swap } from "@/chain/solana/swap";
import { address } from "@solana/kit";
import { createSeed } from "@/chain/solana/wallet";

export default async function Home() {
  let account = "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY";
  let balance = await getBalance(address(account));
  // let tokenAccounts = await getTokenAccounts(address(account));
  // getUserAssets(address("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"));
  // await swap();
  await createSeed();
  return (
    <div>
      <h1>{balance}</h1>
    </div>
  );
}

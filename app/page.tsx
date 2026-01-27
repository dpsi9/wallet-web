import { getUserAssets } from "@/chain/getUserAssets";
import { getSolBalance, getTokenAccounts } from "@/chain/solana";
import { address } from "@solana/kit";

export default async function Home() {
  let account = "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY";
  let balance = await getSolBalance(address(account));
  let tokenAccounts = await getTokenAccounts(address(account));
  getUserAssets(address("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"));
  return (
    <div>
      <h1>{balance}</h1>
    </div>
  );
}

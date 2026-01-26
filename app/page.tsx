import { getSolBalance, getTokenAccounts, getTokenRegistry } from "@/chain/solana";
import { address } from "@solana/kit";

export default async function Home() {
  let account = "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY";
  let balance = await getSolBalance(address(account));
 let x = await getTokenRegistry();
  let tokenAccounts = await getTokenAccounts(address(account));
  return (
    <div>
      <h1>{balance}</h1>
    </div>
  );
}

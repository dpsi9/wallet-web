import { Keypair, VersionedTransaction } from "@solana/web3.js";
import axios from "axios";

export async function swap(
  inputMint: string,
  outputMint: string,
  amount: number,
  taker: string,
  walletBytes: Uint8Array,
) {
  try {
    const orderResponse = await axios.get("https://api.jup.ag/ultra/v1/order", {
      params: {
        inputMint,
        outputMint,
        amount,
        taker,
      },
      headers: {
        "x-api-key": process.env.JUPITER_API_KEY,
      },
    });

    const transactionBase64 = orderResponse.data.transaction;
    const requestId = orderResponse.data.requestId;

    if (!transactionBase64 || !requestId) {
      throw new Error("cannot get swap response");
    }

    // convert base64 transaction into versioned transaction(jupiter expects it)
    const transactionBuffer = Buffer.from(transactionBase64, "base64");
    const transaction = VersionedTransaction.deserialize(transactionBuffer);

    const signer = Keypair.fromSecretKey(walletBytes);

    transaction.sign([signer]);
    const signedTransaction = Buffer.from(transaction.serialize()).toString("base64");

    const executeResponse = await axios.post(
      "https://api.jup.ag/ultra/v1/execute",
      {
        signedTransaction,
        requestId,
      },
      {
        headers: {
          "x-api-key": process.env.JUPITER_API_KEY!,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Swap executed: ", executeResponse.data);
    return executeResponse.data;
  } catch (error) {
    console.error("Swap failed: ", error);
    throw error;
  }
}

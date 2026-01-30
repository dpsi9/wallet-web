import axios from "axios";
import {createTrans} from "@solana/kit"

export async function swap(inputMint: string, outputMint: string, amount: number, taker: string) {
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

}

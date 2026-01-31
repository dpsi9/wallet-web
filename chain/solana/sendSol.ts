import { getTransferSolInstruction } from "@solana-program/system";
import {
  address,
  appendTransactionMessageInstructions,
  createKeyPairSignerFromBytes,
  createTransactionMessage,
  lamports,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  sendAndConfirmTransactionFactory,
  getSignatureFromTransaction,
  compileTransaction,
  TransactionMessageBytesBase64,
  assertIsTransactionWithBlockhashLifetime,
} from "@solana/kit";
import { createClient } from "./client";

export async function sendSol(wallet: Uint8Array, receiver: string, amountLamports: bigint) {
  if (amountLamports <= 0n) {
    throw new Error("Invalid amount");
  }

  const signer = await createKeyPairSignerFromBytes(wallet);
  const receiverAddress = address(receiver);
  const client = createClient();

  const { value: balance } = await client.rpc.getBalance(signer.address).send();

  const transferIx = getTransferSolInstruction({
    source: signer,
    destination: receiverAddress,
    amount: lamports(amountLamports),
  });

  // fetch blockhash specifically for THIS transaction
  const { value: latestBlockhash } = await client.rpc.getLatestBlockhash().send();

  const txMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(signer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions([transferIx], tx),
  );

  const compiled = compileTransaction(txMessage);
  const messageBase64 = Buffer.from(compiled.messageBytes).toString(
    "base64",
  ) as TransactionMessageBytesBase64;

  const feeResp = await client.rpc.getFeeForMessage(messageBase64).send();

  if (feeResp.value === null) {
    throw new Error("Fee calculation failed");
  }

  const feeLamports = BigInt(feeResp.value);
  const totalCost = amountLamports + feeLamports;

  if (balance < totalCost) {
    throw new Error("Insufficient balance for amount + fee");
  }

  const signedTx = await signTransactionMessageWithSigners(txMessage);
  assertIsTransactionWithBlockhashLifetime(signedTx);

  const sendAndConfirm = sendAndConfirmTransactionFactory({
    rpc: client.rpc,
    rpcSubscriptions: client.rpcSubscriptions,
  });

  await sendAndConfirm(signedTx, { commitment: "confirmed" });

  const signature = getSignatureFromTransaction(signedTx);
  return signature;
}

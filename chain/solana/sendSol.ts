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
  getSignatureFromTransaction,
  compileTransaction,
  TransactionMessageBytesBase64,
  getBase64EncodedWireTransaction,
} from "@solana/kit";
import { createClient, type Network } from "./client";

export async function sendSol(
  wallet: Uint8Array,
  receiver: string,
  amountLamports: bigint,
  network: Network = "mainnet"
) {
  if (amountLamports <= 0n) {
    throw new Error("Invalid amount");
  }

  const signer = await createKeyPairSignerFromBytes(wallet);
  const receiverAddress = address(receiver);
  const client = createClient(network);

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
  const signature = getSignatureFromTransaction(signedTx);

  // Send transaction using sendTransaction RPC (no WebSocket needed)
  const encodedTx = getBase64EncodedWireTransaction(signedTx);
  await client.rpc.sendTransaction(encodedTx, {
    encoding: 'base64',
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  }).send();

  // Poll for confirmation instead of using WebSocket
  const maxRetries = 30;
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const status = await client.rpc.getSignatureStatuses([signature]).send();
    const result = status.value[0];
    if (result) {
      if (result.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(result.err)}`);
      }
      if (result.confirmationStatus === 'confirmed' || result.confirmationStatus === 'finalized') {
        return signature;
      }
    }
  }

  throw new Error('Transaction confirmation timeout');
}

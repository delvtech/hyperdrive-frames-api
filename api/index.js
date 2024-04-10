/* eslint-disable react/jsx-key */
import express from "express";
import { ReadHyperdrive } from "@delvtech/hyperdrive-viem";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

const port = 3000;

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

async function getHyperdriveData(address) {
  const hyperdrive = new ReadHyperdrive({
    address: address, // hyperdrive contract address
    publicClient,
  });

  const txnDataRes = await fetch(
    `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startBlock=5660380=latest&apikey=A1EQP4FE7ND3JN5N4TYYXQIWWN8KD9HCNS`
  );
  const txnDataJson = await txnDataRes.json();
  const numTxns = txnDataJson.result.length;

  const fixedRate = (await hyperdrive.getSpotRate()).toString();
  const tvl = (await hyperdrive.getLiquidity()).toString();

  return JSON.stringify({
    tvl,
    fixedRate,
    numTxns,
  });
}

async function handler(req, res) {
  const data = await getHyperdriveData(req.query.address);
  return res.send(data);
}

const app = express();

app.get("/", handler);
app.post("/", handler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

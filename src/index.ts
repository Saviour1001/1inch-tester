// fetch yourself an API key from https://portal.1inch.dev/
// and paste it in the API_KEY const below

import axios from "axios";
import { API_KEY } from "./constants";

// these tokens are just for testing, you can use all the tokens you want
const tokenList = {
  nativeToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
};

// the structure of the response from the API
interface callDataAPIResponse {
  toAmount: string;
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
}

// 1inch supports more chains, but for this example we will use mainnet
const chainIDs = {
  mainnet: "1",
  polygonMainnet: "137",
  binanceSmartChain: "56",
};

// this function fetches the price of a swap
async function getPrice(
  srcTokenAddress: string,
  dstTokenAddress: string,
  amount: string
) {
  const url = "https://api.1inch.dev/swap/v5.2/" + chainIDs.mainnet + "/quote";

  const config = {
    headers: {
      Authorization: "Bearer " + API_KEY,
    },
    params: {
      src: srcTokenAddress,
      dst: dstTokenAddress,
      amount: amount,
    },
  };

  try {
    const response = await axios.get(url, config);
    const quote = response.data.toAmount;
    return quote / 10 ** 12;
  } catch (error) {
    console.error(error);
  }
}

// this function creates the transaction data for a swap and returns it
// once you get the transaction data, you can sign it and send it to the network
// and you are good to go
async function getCallData(
  srcTokenAddress: string,
  dstTokenAddress: string,
  amount: string,
  userWalletAddress: string,
  slippage?: string | "1"
) {
  const url = "https://api.1inch.dev/swap/v5.2/" + chainIDs.mainnet + "/swap";

  const config = {
    headers: {
      Authorization: "Bearer " + API_KEY,
    },
    params: {
      src: srcTokenAddress,
      dst: dstTokenAddress,
      amount: amount,
      from: userWalletAddress,
      slippage: slippage,
    },
  };

  let txn; // txn object

  try {
    const response = await axios.get(url, config);
    const rawData = response.data as callDataAPIResponse;

    txn = rawData.tx;

    return txn;
    // use a library like ethers or web3 to sign the transaction
  } catch (error) {
    console.error(error);
  }
}

// const fetchedPrice = await getPrice(tokenList.USDC, tokenList.WETH, "100");
// console.log("fetched the price", fetchedPrice);

const callData = await getCallData(
  tokenList.nativeToken,
  tokenList.WETH,
  "100",
  "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  "1"
);

console.log("created the transaction", callData);

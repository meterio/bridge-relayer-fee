import { ethers } from "ethers";

export enum Network {
  Ethereum = "Ethereum",
  MeterMainnet = "MeterMainnet",
  BSCMainnet = "BSCMainnet",
  AvalancheMainnet = "AvalancheMainnet",
  Ropsten = "Ropsten",
  MeterTestnet = "MeterTestnet",
  BSCTestnet = "BSCTestnet",
  AvalancheTestnet = "AvalancheTestnet",
}

export enum Mode {
  Main = "main",
  Test = "test",
}

export class ChainConfig {
  network: Network;
  chainId: number;
  providerUrl: string;
  bridgeAddr: string;
  handlerAddr: string;
  provider?: ethers.providers.Provider;
  bridge?: ethers.Contract;
  windowSize: number;
}

export const mainConfigs: ChainConfig[] = [
  {
    network: Network.Ethereum,
    providerUrl:
      "https://mainnet.infura.io/v3/2ad4eeb4c6a14a88b7b16872a0404a9a",
    chainId: 1,
    bridgeAddr: "0xa2A22B46B8df38cd7C55E6bf32Ea5a32637Cf2b1",
    handlerAddr: "0xde4fC7C3C5E7bE3F16506FcC790a8D93f8Ca0b40",
    windowSize: 500000,
  },
  {
    network: Network.AvalancheMainnet,
    providerUrl: "https://api.avax.network/ext/bc/C/rpc",
    chainId: 2,
    bridgeAddr: "0xF41e7FC4eC990298d36f667B93951c9dba65224e",
    handlerAddr: "0x123455360bE78C9289B38bcb4DbA427D9a6cD440",
    windowSize: 5000,
  },
  {
    network: Network.MeterMainnet,
    providerUrl: "https://rpc.meter.io",
    chainId: 3,
    bridgeAddr: "0x3f396Af107049232Bc2804C171ecad65DBCC0323",
    handlerAddr: "0x60f1ABAa3ED8A573c91C65A5b82AeC4BF35b77b8",
    windowSize: 1000000,
  },
  {
    network: Network.BSCMainnet,
    providerUrl: "https://bsc-dataseed.binance.org/",
    chainId: 4,
    bridgeAddr: "0xFd55eBc7bBde603A048648C6eAb8775c997C1001",
    handlerAddr: "0x5945241BBB68B4454bB67Bd2B069e74C09AC3D51",
    windowSize: 5000,
  },
  
];

const meterNetworks = {
  test: {
    providerUrl: "http://shoal.meter.io",
    chainTag: 0x65,
  },
  main: {
    providerUrl: "http://mainnet.meter.io",
    chainTag: 0x52,
  },
};

export const getChainTag = (mode: Mode) => {
  if (mode === Mode.Test) {
    return meterNetworks.test.chainTag;
  } else {
    return meterNetworks.main.chainTag;
  }
};

export const getUrl = (mode: Mode) => {
  if (mode === Mode.Test) {
    return meterNetworks.test.providerUrl;
  } else {
    return meterNetworks.main.providerUrl;
  }
};

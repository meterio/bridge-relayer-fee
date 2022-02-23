import { ethers } from "ethers";

export const UNIT_WEI = 1e18;

// Please reference https://github.com/meterio/bridge-sync/blob/master/src/const/network.ts
export enum Network {
  Ethereum = "Ethereum",
  MeterMainnet = "MeterMainnet",
  BSCMainnet = "BSCMainnet",
  AvalancheMainnet = "AvalancheMainnet",
  Ropsten = "Ropsten",
  MeterTestnet = "MeterTestnet",
  BSCTestnet = "BSCTestnet",
  AvalancheTestnet = "AvalancheTestnet",
  MoonriverMainnet = "MoonriverMainnet",
  MoonriverTestnet = "MoonriverTestnet",
  ThetaMainnet = "ThetaMainnet",
  PolisMainnet = "PolisMainnet",
  PolygonMainnet = "PolygonMainnet"
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
  windowSize: number;
  coinId: string;
  symbol: string;
}

export const mainConfigs: ChainConfig[] = [
  {
    network: Network.Ethereum,
    providerUrl:
      "https://mainnet.infura.io/v3/2ad4eeb4c6a14a88b7b16872a0404a9a",
    chainId: 1,
    bridgeAddr: "0xb61B5aca15193ECB719433d0E5c066f9980E1e83",
    handlerAddr: "0xde4fC7C3C5E7bE3F16506FcC790a8D93f8Ca0b40",
    windowSize: 500000,
    coinId: "ethereum",
    symbol: "ETH",
  },
  {
    network: Network.MeterMainnet,
    providerUrl: "https://rpc.meter.io",
    chainId: 3,
    bridgeAddr: "0x411b6aef79d44CEa36979Ca1525831C8DE37Da90",
    handlerAddr: "0x60f1ABAa3ED8A573c91C65A5b82AeC4BF35b77b8",
    windowSize: 1000000,
    coinId: "meter-stable",
    symbol: "MTR",
  },
  {
    network: Network.BSCMainnet,
    providerUrl: "https://bsc-dataseed.binance.org/",
    chainId: 4,
    bridgeAddr: "0x0316f3A2f01bf3934f10F24217a0F802Eac3FBD7",
    handlerAddr: "0x5945241BBB68B4454bB67Bd2B069e74C09AC3D51",
    windowSize: 5000,
    coinId: "binancecoin",
    symbol: "BNB",
  },
  {
    network: Network.AvalancheMainnet,
    providerUrl: "https://api.avax.network/ext/bc/C/rpc",
    chainId: 2,
    bridgeAddr: "0x6154a8611fb02f250eA3FA0C8C8a8CB56931eBf2",
    handlerAddr: "0x48A6fd66512D45006FC0426576c264D03Dfda304",
    windowSize: 5000,
    coinId: "avalanche-2",
    symbol: "AVAX",
  },
  {
    network: Network.MoonriverMainnet,
    providerUrl: "https://rpc.moonriver.moonbeam.network",
    chainId: 5,
    bridgeAddr: "0xa53cC329AD9555c51F02f37b3cC93a2be4a166Be",
    handlerAddr: "0x48A6fd66512D45006FC0426576c264D03Dfda304",
    windowSize: 10000,
    coinId: "moonriver",
    symbol: "MOVR",
  },
  {
    chainId: 6,
    network: Network.ThetaMainnet,
    bridgeAddr: "0xF6853fbEF2a90be8cB66364957fB8B7793c03656",
    handlerAddr: "0x48A6fd66512D45006FC0426576c264D03Dfda304",
    providerUrl: "https://eth-rpc-api.thetatoken.org/rpc",
    symbol: "TFUEL",
    windowSize: 5000,
    coinId: 'theta-fuel'
  },
  {
    chainId: 7,
    network: Network.PolisMainnet,
    bridgeAddr: "0x6154a8611fb02f250eA3FA0C8C8a8CB56931eBf2",
    handlerAddr: "0x911F32FD5d347b4EEB61fDb80d9F1063Be1E78E6",
    providerUrl: "https://rpc.polis.tech",
    symbol: "POLIS",
    windowSize: 10000,
    coinId: 'polis'
  },
  {
    chainId: 10,
    network: Network.PolygonMainnet,
    bridgeAddr: "0x92D144A99bD3aB1177B8Df600769Ad5422DE7819",
    handlerAddr: "0x123455360bE78C9289B38bcb4DbA427D9a6cD440",
    providerUrl: "https://polygon-rpc.com",
    symbol: "MATIC",
    windowSize: 10000,
    coinId: 'matic-network'
  }
];
for (const c of mainConfigs) {
  c.provider = new ethers.providers.JsonRpcProvider(c.providerUrl);
}

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

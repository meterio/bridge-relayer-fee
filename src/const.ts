import { ethers } from 'ethers';

export enum Network {
  Ethereum = 'Ethereum',
  MeterMainnet = 'MeterMainnet',
  BSCMainnet = 'BSCMainnet',
  Ropsten = 'Ropsten',
  MeterTestnet = 'MeterTestnet',
  BSCTestnet = 'BSCTestnet',
}

export enum Mode {
  Main = 'main',
  Test = 'test',
}

export class ChainConfig {
  network: Network;
  chainId: number;
  providerUrl: string;
  bridgeAddr: string;
  handlerAddr: string;
  startBlockNum: number;
  provider?: ethers.providers.Provider;
  bridge?: ethers.Contract;
  windowSize: number;
}

export const mainConfigs: ChainConfig[] = [
  {
    network: Network.Ethereum,
    providerUrl: 'https://mainnet.infura.io/v3/2ad4eeb4c6a14a88b7b16872a0404a9a',
    chainId: 1,
    bridgeAddr: '0xbD515E41DF155112Cc883f8981CB763a286261be',
    handlerAddr: '0xde4fC7C3C5E7bE3F16506FcC790a8D93f8Ca0b40',
    startBlockNum: 12345342,
    windowSize: 500000,
  },
  {
    network: Network.MeterMainnet,
    providerUrl: 'https://rpc.meter.io',
    chainId: 3,
    bridgeAddr: '0x7C6Fb3B4a23BD9b0c2874bEe4EF672C64e83838B',
    handlerAddr: '0x60f1ABAa3ED8A573c91C65A5b82AeC4BF35b77b8',
    startBlockNum: 10898522,
    windowSize: 1000000,
  },
  {
    network: Network.BSCMainnet,
    providerUrl: 'https://bsc-dataseed.binance.org/',
    chainId: 4,
    bridgeAddr: '0x223fafbc2cA53A75CcfF5B2369128d3d1a828F36',
    handlerAddr: '0x5945241BBB68B4454bB67Bd2B069e74C09AC3D51',
    startBlockNum: 7847876,
    windowSize: 5000,
  },
];

const meterNetworks = {
  test: {
    providerUrl: 'http://shoal.meter.io',
    chainTag: 0x65,
  },
  main: {
    providerUrl: 'http://mainnet.meter.io',
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

import BigNumber from 'bignumber.js';

export abstract class ScanAPI {
  constructor() {}

  abstract getTxsByAccount(
    address: string,
    startBlock: number | string,
    endBlock: number | string,
    sort: string
  ): Promise<any>;

  abstract getBalance(provider: string, address: string): Promise<BigNumber>;

  abstract getTransaction(provider: string, txHash: string): Promise<any>;

  abstract getBlockNumber(provider: string): Promise<number>;
}

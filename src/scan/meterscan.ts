import axios from "axios";
import BigNumber from "bignumber.js";
import Web3 from "web3";

import { ScanAPI } from "./scanapi";

export class MeterScanAPI extends ScanAPI {
  constructor() {
    super();
  }

  async getTxsByAccount(
    address: string,
    startBlock: number | string = 0,
    endBlock: number | string = "latest",
    sort = "asc"
  ): Promise<any> {
    const url = `https://api.meter.io:8000/api/accounts/${address}/txlist?startblock=${startBlock}&endblock=${endBlock}&sort=${sort}`;
    const res = await axios.get(url);
    return res.data.txSummaries.map((tx) => ({
      from: tx.origin,
      to: tx.majorTo,
      gasUsed: tx.paid,
      gasPrice: 1,
    }));
  }
  async getBalance(provider: string, address: string): Promise<BigNumber> {
    const res = await axios.get(`${provider}/accounts/${address}`);
    return new BigNumber(res.data.energy);
  }
  async getTransaction(provider: string, txHash: string): Promise<any> {
    const res = await axios.get(`${provider}/transactions/${txHash}`);
    let tx = res.data;
    return {
      ...tx,
      input: tx.clauses && tx.clauses.length > 0 ? tx.clauses[0].data : "",
    };
  }
  async getBlockNumber(provider: string): Promise<number> {
    const res = await axios.get(`${provider}/blocks/best`);
    let blk = res.data;
    return Number(blk.number);
  }
}

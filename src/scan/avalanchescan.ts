import axios from "axios";
import BigNumber from "bignumber.js";
import Web3 from "web3";

import { ScanAPI } from "./scanapi";

export class AvalancheScanAPI extends ScanAPI {
  constructor() {
    super();
  }

  async getTxsByAccount(
    address: string,
    startBlock: string | number = 0,
    endBlock: string | number = "latest",
    sort: string
  ): Promise<any> {
    let url = `https://explorerapi.avax.network/v2/ctransactions?address=${address}`;
    const start = Number(startBlock);
    const end = Number(endBlock);

    if (!isNaN(start) && start > 0) {
      url += `&blockStart=${startBlock}`;
    }
    if (!isNaN(end) && end > 0) {
      url += `&blockEnd=${endBlock}`;
    }

    const res = await axios.get(url);
    return res.data.Transactions.map(tx=>({...tx, from:tx.fromAddr, to:tx.toAddr, gasUsed:tx.blockGasUsed}));
  }

  async getBalance(provider: string, address: string): Promise<BigNumber> {
    const web3 = new Web3(provider);
    const balance = await web3.eth.getBalance(address);
    return new BigNumber(balance);
  }

  async getTransaction(provider: string, txHash: string): Promise<any> {
    const web3 = new Web3(provider);
    return await web3.eth.getTransaction(txHash);
  }

  async getBlockNumber(provider: string): Promise<number> {
    const web3 = new Web3(provider);
    return await web3.eth.getBlockNumber();
  }
}

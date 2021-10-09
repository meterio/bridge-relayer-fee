import axios from "axios";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import { ScanAPI } from "./scanapi";

export class BSCScanAPI extends ScanAPI {
  async getTxsByAccount(
    address: string,
    startBlock: number | string = 0,
    endBlock: number | string = "latest",
    sort = "asc"
  ): Promise<any> {
    const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&sort=${sort}&apikey=${process.env.BSCSCAN_API_KEY}`;
    const res = await axios.get(url);
    return res.data.result;
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

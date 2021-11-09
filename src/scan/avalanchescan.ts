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
    const url = `https://api.snowtrace.io/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&sort=${sort}&apikey=${process.env.AVALANCHE_API_KEY}`;
    const res = await axios.get(url);
    return res.data.result;
  }
}

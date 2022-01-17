import axios from "axios";


import { ScanAPI } from "./scanapi";

const MaxBlockPerQuery: number = 4999;

export class ThetaScanAPI extends ScanAPI {
  
  constructor() {
    super();
  }

  async getTxsByAccount(
    address: string,
    startBlock: string | number = 0,
    endBlock: string | number = "latest",
    sort: string
  ): Promise<any> {
    let result = [];
    let start = Number(startBlock);
    let end = start + MaxBlockPerQuery;
    for (;;) {
      if (start > endBlock) {
        console.log(`Get Theta txs start block ${start} great than end block ${endBlock}, quit loop`)
        break;
      }
      if (end >= endBlock) {
        end = Number(endBlock);
      }
      console.log(`Get Theta txs from ${start} to ${end}`)
      const url = `https://explorer.thetatoken.org:8443/api/transactions/blockrange?blockStart=${start}&blockEnd=${end}`;
      const res = await axios.get(url);
      const txs = res.data.body.data
      console.log('txs length: ', txs.length);
      for (const tx of txs) {
        if (tx.data.from && tx.data.to) {
          result.push({
            ...tx,
            from: tx.data.from.address,
            to: tx.data.to.address,
            gasUsed: tx.receipt.GasUsed,
            gasPrice: tx.data.gas_price
          })
        }
      }

      start = end + 1;
      end = start + MaxBlockPerQuery;
    }
    
    return result;
  }
}

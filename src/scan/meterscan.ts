import axios from "axios";
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
      to: tx.clauses[0].to,
      gasUsed: tx.paid,
      gasPrice: 1,
    }));
  }
}

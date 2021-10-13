import axios from "axios";
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
}

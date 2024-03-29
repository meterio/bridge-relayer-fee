import axios from "axios";
import { ScanAPI } from "./scanapi";

export class MoonriverScanAPI extends ScanAPI {
  constructor() {
    super();
  }

  async getTxsByAccount(
    address: string,
    startBlock: number | string = 0,
    endBlock: number | string = "latest",
    sort = "asc"
  ): Promise<any> {
    const url = `https://blockscout.moonriver.moonbeam.network/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&sort=${sort}`;
    const res = await axios.get(url);
    return res.data.result;
  }
}

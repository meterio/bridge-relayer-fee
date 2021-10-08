import { Network } from "../const";

import * as bscscan from "./bscscan";
import * as etherscan from "./etherscan";
import * as meterscan from "./meterscan";

export const SCAN_APIS = {
  [Network.Ethereum]: new etherscan.EthScanAPI(),
  [Network.BSCMainnet]: new bscscan.BSCScanAPI(),
  [Network.MeterMainnet]: new meterscan.MeterScanAPI(),
};

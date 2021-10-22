import { Network } from "../const";

import {BSCScanAPI} from "./bscscan";
import {EthScanAPI} from "./etherscan";
import {MeterScanAPI} from "./meterscan";
import {AvalancheScanAPI} from "./avalanchescan";
import {MoonbeamScanAPI} from "./moonbeamscan"

export const SCAN_APIS = {
  [Network.Ethereum]: new EthScanAPI(),
  [Network.BSCMainnet]: new BSCScanAPI(),
  [Network.MeterMainnet]: new MeterScanAPI(),
  [Network.AvalancheMainnet]: new AvalancheScanAPI(),
  [Network.MoonriverMainnet]: new MoonbeamScanAPI()
};

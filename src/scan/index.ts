import { Network } from "../const";

import {BSCScanAPI} from "./bscscan";
import {EthScanAPI} from "./etherscan";
import {MeterScanAPI} from "./meterscan";
import {AvalancheScanAPI} from "./avalanchescan";
import {MoonriverScanAPI} from "./moonriverscan";
import {PolisScanAPI} from "./polisscan";
import {ThetaScanAPI} from "./thetascan";
import { PolygonScanAPI } from "./polygonscan";

export const SCAN_APIS = {
  [Network.Ethereum]: new EthScanAPI(),
  [Network.BSCMainnet]: new BSCScanAPI(),
  [Network.MeterMainnet]: new MeterScanAPI(),
  [Network.AvalancheMainnet]: new AvalancheScanAPI(),
  [Network.MoonriverMainnet]: new MoonriverScanAPI(),
  [Network.PolisMainnet]: new PolisScanAPI(),
  [Network.ThetaMainnet]: new ThetaScanAPI(),
  [Network.PolygonMainnet]: new PolygonScanAPI()
};

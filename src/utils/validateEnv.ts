import { cleanEnv, num, port, str } from 'envalid';

function validateEnv() {
  cleanEnv(process.env, {
    // api key
    ETHERSCAN_API_KEY: str(),
    BSCSCAN_API_KEY: str(),
    
    // relayer
    RELAYER_ADDRESSES: str(),
    ETH_START_BLOCK: num(),
    ETH_END_BLOCK: str(),
    METER_START_BLOCK: num(),
    METER_END_BLOCK: str(),
    BSC_START_BLOCK: num(),
    BSC_END_BLOCK: str(),
  });
}

require('dotenv').config();
validateEnv();

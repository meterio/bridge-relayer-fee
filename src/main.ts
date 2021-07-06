require('./utils/validateEnv');

import path from 'path';

import BigNumber from 'bignumber.js';
import { ChainConfig, Network, mainConfigs} from './const';
import { saveCSVFromObjects } from './utils/csv';
import * as bscscan from './utils/bscscan';
import * as etherscan from './utils/etherscan';
import * as meterscan from './utils/meterscan';


const {
  RELAYER_ADDRESSES,
  ETH_START_BLOCK,
  ETH_END_BLOCK,
  METER_START_BLOCK,
  METER_END_BLOCK,
  BSC_START_BLOCK,
  BSC_END_BLOCK,
} = process.env;

export class RelayerFeeCalculator {
  private configs: ChainConfig[] =mainConfigs;

  constructor() { }

  async start() {
    let relayerAddrs = {};
    for (const addr of RELAYER_ADDRESSES.split(',')) {
      const lowerCaseAddr = addr.toLowerCase();
      relayerAddrs[lowerCaseAddr] = true;
    }

    for (const config of this.configs) {
      let txs = [];
      let startBlock = '0';
      let endBlock = 'latest';
      switch (config.network) {
        case Network.Ethereum:
          txs = await etherscan.getTxsByAccount(config.bridgeAddr, ETH_START_BLOCK, ETH_END_BLOCK);
          startBlock = ETH_START_BLOCK;
          endBlock = ETH_END_BLOCK;
          break;
        case Network.MeterMainnet:
          txs = await meterscan.getTxsByAccount(config.bridgeAddr, METER_START_BLOCK, METER_END_BLOCK);
          startBlock = METER_START_BLOCK;
          endBlock = METER_END_BLOCK;
          break;
        case Network.BSCMainnet:
          txs = await bscscan.getTxsByAccount(config.bridgeAddr, BSC_START_BLOCK, BSC_END_BLOCK);
          startBlock = BSC_START_BLOCK;
          endBlock = BSC_END_BLOCK;
      }
      console.log(`--- Calculating relayer fee for ${Network[config.network]} in block range [${startBlock}, ${endBlock})`)

      txs = txs.filter((tx) => tx.from.toLowerCase() in relayerAddrs || tx.to.toLowerCase() in relayerAddrs);

      let gasSubtotals: { [key: string]: BigNumber } = {};
      let totalGas = new BigNumber(0);
      for (const tx of txs) {
        let relayer = '';
        if (tx.from.toLowerCase() in relayerAddrs) {
          relayer = tx.from.toLowerCase();
        } else {
          relayer = tx.to.toLowerCase();
        }
        if (!(relayer in gasSubtotals)) {
          gasSubtotals[relayer] = new BigNumber(0);
        }
        const gas = new BigNumber(tx.gasUsed).times(tx.gasPrice ? tx.gasPrice: 1)

        gasSubtotals[relayer] = gasSubtotals[relayer].plus( gas);
        totalGas = totalGas.plus(gas)
      }

      console.log('Total used gas: ', totalGas.toString());

      let balance = new BigNumber(0);
      switch (config.network) {
        case Network.Ethereum:
          balance = await etherscan.getBalance(config.providerUrl, config.bridgeAddr);
          break;
        case Network.MeterMainnet:
          balance = await meterscan.getBalance(config.network, config.bridgeAddr);
          break;
        case Network.BSCMainnet:
          balance = await bscscan.getBalance(config.providerUrl, config.bridgeAddr);
          break;
      }
      console.log(`Current bridge balance: `, balance.toString());

      let results = [];
      for (const addr in gasSubtotals) {
        const subtotal = gasSubtotals[addr];
        const percent = subtotal.dividedBy(totalGas);
        results.push({
          addr,
          award: balance.times(subtotal).dividedBy(totalGas).toFixed(0),
          gasPercent: percent.toFixed(3),
          gasUsed: subtotal.toFixed(0),
          startBlock,
          endBlock,
        });
        console.log(`Relayer ${addr} used ${percent.times(100).toFixed(1)}% of total gas`)
      }

      await saveCSVFromObjects(
        results,
        [
          { id: 'addr', title: 'Address' },
          { id: 'award', title: 'Award' },
          { id: 'gasPercent', title: 'Gas%' },
          { id: 'gasUsed', title: 'Gas Used' },
          { id: 'startBlock', title: 'Start Block' },
          { id: 'endBlock', title: 'End Block' },
        ],
        path.join(__dirname, '..','csv', `relayer-${Network[config.network].toLowerCase()}.csv`)
      );

      console.log(`csv/relayer-${Network[config.network].toLowerCase()}.csv saved.`);
    }
  }

  async stop() {}
}



new RelayerFeeCalculator().start()
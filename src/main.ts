require("./utils/validateEnv");

import path from "path";

import BigNumber from "bignumber.js";
import { ChainConfig, Network, mainConfigs } from "./const";
import { saveCSVFromObjects } from "./utils/csv";
import { SCAN_APIS } from "./scan";

const {
  RELAYER_ADDRESSES,
  ETH_START_BLOCK,
  ETH_END_BLOCK,
  METER_START_BLOCK,
  METER_END_BLOCK,
  BSC_START_BLOCK,
  BSC_END_BLOCK,
  AVA_START_BLOCK,
  AVA_END_BLOCK,
} = process.env;

console.log(BSC_START_BLOCK)
export class RelayerFeeCalculator {
  private configs: ChainConfig[] = mainConfigs;

  constructor() {}

  async start() {
    let relayerAddrs = {};
    for (const addr of RELAYER_ADDRESSES.split(",")) {
      const lowerCaseAddr = addr.toLowerCase();
      relayerAddrs[lowerCaseAddr] = true;
    }

    for (const config of this.configs) {
      let txs = [];
      let startBlock: Number | String = 0;
      let endBlock: Number | String = "latest";
      switch (config.network) {
        case Network.MeterMainnet:
          startBlock = METER_START_BLOCK;
          endBlock = METER_END_BLOCK;
          break;
        case Network.Ethereum:
          startBlock = ETH_START_BLOCK;
          endBlock = ETH_END_BLOCK;
          break;
        case Network.BSCMainnet:
          startBlock = BSC_START_BLOCK;
          endBlock = BSC_END_BLOCK;
          break;
        case Network.AvalancheMainnet:
          startBlock = AVA_START_BLOCK;
          endBlock = AVA_END_BLOCK;
          break;
      }

      if (!(config.network in SCAN_APIS)) {
        console.log("NOT SUPPORTED NETWORK: ", Network[config.network]);
        continue;
      }
      const api = SCAN_APIS[config.network];

      let providerUrl = config.providerUrl;

      if (config.network === Network.MeterMainnet) {
        providerUrl = "http://mainnet.meter.io:8669";
      }

      console.log('-'.repeat(60))
      console.log(`Scanning ${Network[config.network]}`)
      console.log(`Provider URL: ${providerUrl}`)

      if (endBlock.toLowerCase() === "latest") {
        endBlock = await api.getBlockNumber(providerUrl);
      }
      console.log(`Block range: from ${startBlock} to ${endBlock}`)

      txs = await api.getTxsByAccount(config.bridgeAddr, startBlock, endBlock);
      txs = txs.filter(
        (tx) =>
          tx.from.toLowerCase() in relayerAddrs ||
          tx.to.toLowerCase() in relayerAddrs
      );
      console.log(`#Txns: ${txs.length}`)

      let gasSubtotals: { [key: string]: BigNumber } = {};
      let totalGas = new BigNumber(0);
      for (const tx of txs) {
        let relayer = "";
        if (tx.from.toLowerCase() in relayerAddrs) {
          relayer = tx.from.toLowerCase();
        } else {
          relayer = tx.to.toLowerCase();
        }
        if (!(relayer in gasSubtotals)) {
          gasSubtotals[relayer] = new BigNumber(0);
        }
        const gas = new BigNumber(tx.gasUsed).times(tx.gasPrice);

        gasSubtotals[relayer] = gasSubtotals[relayer].plus(gas);
        totalGas = totalGas.plus(gas);
      }

      console.log("Total used gas: ", totalGas.toString());

      const balance = await api.getBalance(providerUrl, config.bridgeAddr);
      console.log(`Current bridge balance: `, balance.toString());

      let results = [];
      console.log('Gas Usage Details')
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
        console.log(
          `  Relayer ${addr} used gas: ${subtotal} = ${percent.times(100).toFixed(1)}% of total gas`
        );
      }

      const date = new Date();
      const month = `0${date.getMonth() + 1}`.slice(-2);
      const day = `0${date.getDate()}`.slice(-2);
      const filename = `${Network[config.network].toLowerCase()}-${month}${day}.csv`;
      const filepath = path.join( __dirname, "..", "csv", filename);
      await saveCSVFromObjects(
        results,
        [
          { id: "addr", title: "Address" },
          { id: "award", title: "Award" },
          { id: "gasPercent", title: "Gas%" },
          { id: "gasUsed", title: "Gas Used" },
          { id: "startBlock", title: "Start Block" },
          { id: "endBlock", title: "End Block" },
        ],
        filepath)

      console.log(
        `Calculation result saved at ${filepath}`
      );
    }
  }

  async stop() {}
}

new RelayerFeeCalculator().start();

require("./utils/validateEnv");

import path from "path";
import fs from "fs";

import BigNumber from "bignumber.js";
import { ChainConfig, Network, mainConfigs, UNIT_WEI } from "./const";
import { saveCSVFromObjects } from "./utils/csv";
import { SCAN_APIS } from "./scan";
import { ethers } from "ethers";
import { getTokenPrice } from "./utils";

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
  MOONRIVER_START_BLOCK,
  MOONRIVER_END_BLOCK,
  POLIS_START_BLOCK,
  POLIS_END_BLOCK,
  THETA_START_BLOCK,
  THETA_END_BLOCK,
  POLYGON_START_BLOCK,
  POLYGON_END_BLOCK
} = process.env;

export class RelayerFeeCalculator {
  private configs: ChainConfig[] = mainConfigs;
  private relayerAddrs = {};
  private startAndEndBolck = {};
  private isDefaultMode = true;

  constructor() {
    this.isDefaultMode = !!!process.argv[2];

    console.log(`Default mode: ${!!!process.argv[2]}`);
    for (const addr of RELAYER_ADDRESSES.split(",")) {
      const lowerCaseAddr = addr.toLowerCase();
      this.relayerAddrs[lowerCaseAddr] = true;
    }
  }

  async start() {
    const {
      subtotalGas,
      allSubtotalGasUSD,
      totalGasUSD,
      bridgeBalances,
      tokenPrices,
    } = await this.resolveTx();
    await this.formatAndWriteCsv(
      subtotalGas,
      allSubtotalGasUSD,
      totalGasUSD,
      bridgeBalances,
      tokenPrices
    );
  }

  async formatAndWriteCsv(
    subtotalGas,
    allSubtotalGasUSD,
    totalGasUSD,
    bridgeBalances,
    tokenPrices
  ) {
    let results = [];
    console.log("-".repeat(80));
    console.log("Gas Usage Details");
    let totalBridgeBalanceUSD = new BigNumber(0);
    for (const key in bridgeBalances) {
      totalBridgeBalanceUSD = totalBridgeBalanceUSD.plus(
        bridgeBalances[key].times(tokenPrices[key])
      );
    }
    console.log(`All bridge balance: ${totalBridgeBalanceUSD} USD.`);
    console.log(`All used gas: ${totalGasUSD} USD.`);

    const summary: { [network: string]: { addrs: string; amounts: string } } =
      {};

    for (const c of this.configs) {
      console.log("-".repeat(80));

      let { startBlock, endBlock } = this.startAndEndBolck[c.network];
      console.log(
        `Get data from ${c.network} by block ${startBlock} to ${endBlock}`
      );

      const tokenPrice = tokenPrices[c.network];
      console.log(`Token ${c.symbol} price: ${tokenPrice} USD.`);

      const bridgeBalance = bridgeBalances[c.network];
      const bridgeBalanceUSD = bridgeBalance.times(tokenPrice);
      console.log(
        `${c.network} bridge balance: ${bridgeBalance} ${c.symbol}, ${bridgeBalanceUSD} USD.`
      );
      // 具体某个network上的所有的gas
      let currNetTotalGas = new BigNumber(0);
      // 具体network上relayer要分的奖励
      const amounts = [];
      const addrs = [];
      for (const item of Object.values(subtotalGas)) {
        for (const key in item as Object) {
          if (key === c.network && item[key]) {
            currNetTotalGas = currNetTotalGas.plus(item[key]);
          }
        }
      }
      const currNetTotalGasUSD = currNetTotalGas.times(tokenPrice);
      console.log(
        `Total gas used on ${c.network}: ${currNetTotalGas} ${c.symbol}, ${currNetTotalGasUSD} USD.`
      );

      for (const addr in this.relayerAddrs) {
        let gasUsed = new BigNumber(0);
        if (subtotalGas[addr] && subtotalGas[addr][c.network]) {
          gasUsed = subtotalGas[addr][c.network];
        } else {
          console.log(
            "relayer not in tx.from or tx.to ",
            addr,
            " in ",
            c.network
          );
        }
        const gasUsedUSD = gasUsed.times(tokenPrice);
        console.log(
          `Relayer ${addr} used gas on ${c.network}: ${gasUsed} ${c.symbol}, ${gasUsedUSD} USD.`
        );

        const allGasUsedUSD = allSubtotalGasUSD[addr] || new BigNumber(0);
        let percent = new BigNumber(0);
        if (this.isDefaultMode) {
          percent = gasUsed.dividedBy(currNetTotalGas);
        } else {
          percent = allGasUsedUSD.dividedBy(totalGasUSD);
        }

        if (percent.isNaN()) {
          percent = new BigNumber(0);
        }

        console.log(
          `Relayer ${addr} used gas percent on ${c.network}: ${percent.times(
            100
          )} %`
        );

        const award = (bridgeBalance as BigNumber).times(percent);
        const awardWei = award.times(UNIT_WEI);
        const awardUSD = award.times(tokenPrice);

        amounts.push(awardWei.toFixed(0));
        addrs.push(addr);

        console.log(
          `Relayer ${addr} award on ${c.network}: ${award} ${c.symbol}, ${awardUSD} USD.`
        );

        results.push({
          network: c.network,
          relayer: addr,
          tokenPrice,
          bridgeBalance: bridgeBalance.toFixed(0),
          bridgeBalanceUSD: bridgeBalanceUSD.toFixed(2),
          totalBridgeBalanceUSD: totalBridgeBalanceUSD.toFixed(2),
          totalGasUSD: totalGasUSD.toFixed(2),
          currNetTotalGas: currNetTotalGas.toFixed(0),
          currNetTotalGasUSD: currNetTotalGasUSD.toFixed(2),
          gasUsed: gasUsed.toFixed(0),
          gasUsedUSD: gasUsedUSD.toFixed(2),
          gasPercent: percent.toFixed(3),
          allGasUsedUSD: allGasUsedUSD.toFixed(2),
          awardWei: awardWei.toFixed(0),
          award: award.toFixed(0),
          awardUSD: awardUSD.toFixed(2),
          startBlock,
          endBlock,
        });
      }

      summary[c.network] = {
        addrs: addrs.join(","),
        amounts: amounts.join(","),
      };

      console.log(
        `Summary ${c.network} --addrs ${summary[c.network].addrs} --amounts ${
          summary[c.network].amounts
        }`
      );
    }

    const date = new Date();
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const filename = `${year}${month}${day}${
      this.isDefaultMode ? "-default" : ""
    }`;
    const filepath = path.join(__dirname, "..", "csv", filename + ".csv");
    await saveCSVFromObjects(
      results,
      [
        { id: "network", title: "Network" },
        { id: "relayer", title: "Relayer" },
        { id: "awardWei", title: "Award Wei" },
        { id: "award", title: "Award Decimals" },
        { id: "awardUSD", title: "Award In USD" },
        { id: "tokenPrice", title: "Token Price In USD" },
        { id: "bridgeBalance", title: "Bridge Balance Decimals" },
        { id: "bridgeBalanceUSD", title: "Bridge Blance In USD" },
        { id: "totalBridgeBalanceUSD", title: "All Bridge Blance In USD" },
        { id: "totalGasUSD", title: "All Gas In USD" },
        { id: "currNetTotalGas", title: "Current Network Total Gas Decimals" },
        { id: "currNetTotalGasUSD", title: "Current Network Total Gas In USD" },
        { id: "gasUsed", title: "Gas Used Decimals" },
        { id: "gasUsedUSD", title: "Gas Used In USD" },
        { id: "gasPercent", title: "Gas Percent" },
        { id: "allGasUsedUSD", title: "All Gas Used In USD" },
        { id: "startBlock", title: "Start Block" },
        { id: "endBlock", title: "End Block" },
      ],
      filepath
    );

    console.log(`Calculation result saved at ${filepath}`);

    const summaryFilepath = path.join(
      __dirname,
      "..",
      "txt",
      filename + ".txt"
    );
    let data = "";
    for (const network in summary) {
      data += network + " --addrs ";
      data += summary[network].addrs + " --amounts ";
      data += summary[network].amounts + "\n";
    }

    fs.writeFileSync(summaryFilepath, data);

    console.log(`Summary saved at ${summaryFilepath}`);
  }

  async resolveTx() {
    //- 所有relayer在所有链上的gas in USD
    let totalGasUSD = new BigNumber(0);
    //- 存储某个relayer在所有链上的gas in USD
    let allSubtotalGasUSD: { [relayer: string]: BigNumber } = {};
    //- bridge上的balance
    let bridgeBalances: { [network: string]: BigNumber } = {};
    //- relayer 在某个链上的gas
    let subtotalGas: {
      [relayer: string]: { [network: string]: BigNumber };
    } = {};
    //- 存储token price
    let tokenPrices: { [network: string]: number } = {};

    for (const config of this.configs) {
      let txs = [];

      let { startBlock, endBlock } = await this.getStartEndBlock(config);

      this.startAndEndBolck[config.network] = {
        startBlock,
        endBlock,
      };

      if (!(config.network in SCAN_APIS)) {
        console.log("NOT SUPPORTED NETWORK: ", Network[config.network]);
        continue;
      }
      const api = SCAN_APIS[config.network];

      console.log("-".repeat(60));
      console.log(`Scanning ${Network[config.network]}`);

      console.log(`Block range: from ${startBlock} to ${endBlock}`);

      txs = await api.getTxsByAccount(config.bridgeAddr, startBlock, endBlock);
      txs = txs.filter(
        (tx) =>
          tx.from.toLowerCase() in this.relayerAddrs ||
          tx.to.toLowerCase() in this.relayerAddrs
      );
      console.log(`#Txns: ${txs.length}`);

      // 获取token价格
      const priceData = await getTokenPrice(config.coinId);
      const price = priceData[config.coinId]["usd"];

      tokenPrices[config.network] = price;

      for (const tx of txs) {
        let relayer = "";
        if (tx.from.toLowerCase() in this.relayerAddrs) {
          relayer = tx.from.toLowerCase();
        } else {
          relayer = tx.to.toLowerCase();
        }
        if (!(relayer in allSubtotalGasUSD)) {
          allSubtotalGasUSD[relayer] = new BigNumber(0);
        }
        if (!(relayer in subtotalGas)) {
          subtotalGas[relayer] = {};
        }
        if (!(config.network in subtotalGas[relayer])) {
          subtotalGas[relayer][config.network] = new BigNumber(0);
        }
        const gas = new BigNumber(tx.gasUsed).times(tx.gasPrice);

        const decimalsGas = gas.div(UNIT_WEI);
        const USDGas = decimalsGas.times(price);

        subtotalGas[relayer][config.network] =
          subtotalGas[relayer][config.network].plus(decimalsGas);
        allSubtotalGasUSD[relayer] = allSubtotalGasUSD[relayer].plus(USDGas);
        totalGasUSD = totalGasUSD.plus(USDGas);
      }

      const balance = (
        await config.provider.getBalance(config.bridgeAddr)
      ).toString();
      const decimalsBalance = new BigNumber(balance).dividedBy(UNIT_WEI);
      bridgeBalances[config.network] = decimalsBalance;
    }

    return {
      subtotalGas,
      allSubtotalGasUSD,
      totalGasUSD,
      bridgeBalances,
      tokenPrices,
    };
  }

  async getStartEndBlock(c: ChainConfig) {
    let startBlock: Number | String = 0;
    let endBlock: Number | String = "latest";

    switch (c.network) {
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
      case Network.MoonriverMainnet:
        startBlock = MOONRIVER_START_BLOCK;
        endBlock = MOONRIVER_END_BLOCK;
        break;
      case Network.PolisMainnet:
        startBlock = POLIS_START_BLOCK;
        endBlock = POLIS_END_BLOCK;
        break;
      case Network.ThetaMainnet:
        startBlock = THETA_START_BLOCK;
        endBlock = THETA_END_BLOCK;
        break;
      case Network.PolygonMainnet:
        startBlock = POLYGON_START_BLOCK;
        endBlock = POLYGON_END_BLOCK;
        break;
      default:
        startBlock = 0;
        endBlock = "latest";
    }

    if (endBlock.toLowerCase() === "latest") {
      endBlock = (await c.provider.getBlockNumber()).toString();
    }

    return {
      startBlock,
      endBlock,
    };
  }

  async stop() {}
}

new RelayerFeeCalculator().start();

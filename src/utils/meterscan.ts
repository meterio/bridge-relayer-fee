import axios from 'axios';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import { Mode,Network } from '../const';

export const getTxsByAccount = async (
  address: string,
  startBlock: number | string = 0,
  endBlock: number | string = 'latest',
  sort = 'asc'
) => {
  const url = `https://api.meter.io:8000/api/accounts/${address}/txlist?startblock=${startBlock}&endblock=${endBlock}&sort=${sort}`;
  const res = await axios.get(url);
  return res.data.txSummaries.map((tx) => ({
    from: tx.origin,
    to: tx.majorTo,
    gasUsed: tx.paid,
  }));
};

export const getBalance = async (network: Network, address: string) => {
  const url = network === Network.MeterMainnet ? 'http://mainnet.meter.io:8669' : 'http://shoal.meter.io:8669';
  const res = await axios.get(`${url}/accounts/${address}`);
  return new BigNumber(res.data.energy);
};

export const getTransaction = async (mode: Mode, txHash: string) => {
  const url = mode === Mode.Main ? 'http://mainnet.meter.io:8669' : 'http://shoal.meter.io:8669';
  const res = await axios.get(`${url}/transactions/${txHash}`);
  let tx = res.data;
  return { ...tx, input: tx.clauses && tx.clauses.length > 0 ? tx.clauses[0].data : '' };
};

export const getBlockNumber = async (provider: string) => {
  const web3 = new Web3(provider);
  return await web3.eth.getBlockNumber();
};

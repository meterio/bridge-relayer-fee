import axios from 'axios';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';

export const getTxsByAccount = async (
  address: string,
  startBlock: number | string = 0,
  endBlock: number | string = 'latest',
  sort = 'asc'
) => {
  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&sort=${sort}&apikey=${process.env.ETHERSCAN_API_KEY}`;
  const res = await axios.get(url);
  return res.data.result;
};

export const getBalance = async (provider: string, address: string) => {
  const web3 = new Web3(provider);
  const balance = await web3.eth.getBalance(address);
  return new BigNumber(balance);
};

export const getTransaction = async (provider: string, txHash: string) => {
  const web3 = new Web3(provider);
  return await web3.eth.getTransaction(txHash);
};

export const getBlockNumber = async (provider: string) => {
  const web3 = new Web3(provider);
  return await web3.eth.getBlockNumber();
};

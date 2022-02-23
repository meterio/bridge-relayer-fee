import axios from "axios";

const PRE_URL = "https://api.coingecko.com/api/v3/simple/price";

export const getTokenPrice = async (coinId) => {
  const url = `${PRE_URL}?ids=${coinId}&vs_currencies=usd`;
  const { data } = await axios.get(url);
  
  return data;
};

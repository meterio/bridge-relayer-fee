## Meter Passport Relayer Calculator

### Usage

Please create a `.env` file under root folder, a sample config is in `.env.sample`. You'll also need to register on etherscan.com and bscscan.com to get API_KEY. And once you have the API_KEY ready, please change these two lines in `.env` with your own keys:

```
ETHERSCAN_API_KEY=<YOUR_ETHER_API_KEY>
BSCSCAN_API_KEY=<YOUR_BSC_API_KEY>
```

Then you can calculate the relayer shares with:

```
yarn
yarn start
```

### Result

Result will be saved under `csv` folder in csv format.
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
- `npm start` 生成的csv文件中Gas%字段通过relayer在具体网络中的used gas 除以这个网络中的total used gas得到。
- `npm start a` 生成的csv文件中Gas%字段通过relayer在所有网络中的used gas 除以所有网络中的total used gas得到。

### Steps for new network support

1. Define `enum Network` in `src/const.ts`, it should be exactly the same with definition here: ``
2. Extend `mainConfigs` in `src/const.ts` with bridge/handler configs
3. Implement `ScanAPI` interface, put the file under `src/scan/`. And update `const SCAN_APIS` in `src/scan/index.ts`
4. Define `XXX_START_BLOCK` and `XXX_END_BLOCK` in `.env` file, import and use it in `main.ts`. 
5. 
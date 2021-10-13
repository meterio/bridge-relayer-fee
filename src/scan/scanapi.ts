
export abstract class ScanAPI {
  constructor() {}

  abstract getTxsByAccount(
    address: string,
    startBlock: number | string,
    endBlock: number | string,
    sort: string
  ): Promise<any>;

}

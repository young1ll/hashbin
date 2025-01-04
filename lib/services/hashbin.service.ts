import { Injectable } from '@nestjs/common';

export interface IHashBinService {
  hash(data: string | Buffer): Promise<string>;
  compare(data: string | Buffer, encrypted: string): Promise<boolean>;
}

@Injectable()
export class HashBin<T extends IHashBinService = any> {
  private strategyInstance: T;

  public setInstance(strategy: T | { new (): T }): void {
    if (typeof strategy === 'function') {
      this.strategyInstance = new strategy();
    } else {
      this.strategyInstance = strategy;
    }
  }

  public getInstance(): T {
    return this.strategyInstance;
  }
}

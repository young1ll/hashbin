import { DynamicModule, Module } from '@nestjs/common';
import { HashBin } from './services/hashbin.service';

export interface IHashBinModuleOptions {
  isGlobal?: boolean;
  [key: string]: any;
}

export class HashBinModuleOptions implements IHashBinModuleOptions {
  isGlobal?: boolean;
}

// @reference https://docs.nestjs.com/security/encryption-and-hashing
@Module({})
export class HashBinModule {
  public static register(options?: IHashBinModuleOptions): DynamicModule {
    return {
      global: options?.isGlobal ?? false,
      module: HashBinModule,
      providers: [{ provide: HashBinModuleOptions, useValue: options }, HashBin],
      exports: [HashBinModuleOptions, HashBin],
    };
  }
}

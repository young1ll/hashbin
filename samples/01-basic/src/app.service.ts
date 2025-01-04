import { Inject, Injectable } from '@nestjs/common';
import { BcryptService, HashBin } from '@zeroplate/hashable';

@Injectable()
export class AppService {
  constructor(private readonly hashBin: HashBin) {
    this.hashBin.setInstance(new BcryptService());
  }

  async getHello() {
    return await this.hashBin.getInstance().hash('test-console');
  }
}

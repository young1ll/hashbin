import { Injectable } from '@nestjs/common';
import type Bcrypt from 'bcrypt';
import * as bcrypt from 'bcrypt';
import { IHashBinService } from './hashbin.service';

/**
 * bcrypt 알고리즘에 대한 옵션을 정의하는 타입.
 * 이 타입은 비밀번호 해시화 시 사용할 수 있는 설정을 포함합니다.
 */
export type BcryptOptions = {
  /**
   * bcrypt 알고리즘에서 사용할 salt 값.
   * `string` 타입으로 salt를 명시적으로 제공할 수 있습니다.
   * 일반적으로 salt는 랜덤하게 생성되며, 보안을 강화하는 데 사용됩니다.
   * 값이 제공되지 않으면 bcrypt가 내부적으로 salt를 생성합니다.
   */
  salt?: string;

  /**
   * bcrypt 알고리즘에서 사용할 작업 횟수 (또는 "rounds").
   * `rounds`는 bcrypt 해시를 반복할 횟수로, 이 값이 클수록 계산 비용이 증가하고 보안이 강화됩니다.
   * 기본값은 10으로 설정됩니다.
   */
  rounds?: number;
};

/**
 * BcryptService
 *
 * bcrypt 해싱 알고리즘을 사용하여 데이터를 해싱 및 비교하는 기능을 제공합니다.
 * - 비밀번호 보호 및 무결성 검사를 위한 유틸리티로 활용됩니다.
 * - 비동기 및 동기 메서드를 모두 지원하여 유연한 사용이 가능합니다.
 *
 * @class BcryptService
 * @implements {IHashable}
 */
@Injectable()
export class BcryptService implements IHashBinService {
  private bcrypt!: typeof Bcrypt;

  constructor() {
    this.bcrypt = bcrypt;
  }

  /**
   * 데이터를 bcrypt 알고리즘으로 비동기 해싱합니다.
   *
   * @param {string | Buffer} data - 해싱할 원본 데이터.
   * @param {BcryptOptions} [options] - 사용자 정의 옵션 (salt 또는 rounds).
   * @returns {Promise<string>} 해싱된 결과 문자열.
   *
   * @example
   * const hashed = await service.hash('myPassword');
   */
  async hash(data: string | Buffer, options?: BcryptOptions): Promise<string> {
    const salt = this.getSalt(options);
    return await this.bcrypt.hash(data, salt);
  }

  /**
   * 데이터를 bcrypt 알고리즘으로 동기 해싱합니다.
   *
   * @param {string} data - 해싱할 원본 데이터.
   * @param {BcryptOptions} [options] - 사용자 정의 옵션 (salt 또는 rounds).
   * @returns {string} 해싱된 결과 문자열.
   *
   * @example
   * const hashed = service.hashSync('myPassword');
   */
  hashSync(data: string, options?: BcryptOptions): string {
    const salt = this.getSalt(options);
    return this.bcrypt.hashSync(data, salt);
  }

  /**
   * 해시 값과 원본 데이터를 비동기적으로 비교합니다.
   *
   * @param {string | Buffer} data - 원본 데이터.
   * @param {string} encrypted - 비교할 해시 문자열.
   * @returns {Promise<boolean>} 두 값이 일치하면 true, 아니면 false.
   *
   * @example
   * const isMatch = await service.compare('myPassword', hashedPassword);
   */
  async compare(data: string | Buffer, encrypted: string): Promise<boolean> {
    return await this.bcrypt.compare(data, encrypted);
  }

  /**
   * 해시 값과 원본 데이터를 동기적으로 비교합니다.
   *
   * @param {string} data - 원본 데이터.
   * @param {string} encrypted - 비교할 해시 문자열.
   * @returns {boolean} 두 값이 일치하면 true, 아니면 false.
   *
   * @example
   * const isMatch = service.compareSync('myPassword', hashedPassword);
   */
  compareSync(data: string, encrypted: string): boolean {
    return this.bcrypt.compareSync(data, encrypted);
  }

  /**
   * bcrypt salt를 생성하거나 제공된 옵션에서 추출합니다.
   *
   * @param {BcryptOptions} options - salt 또는 rounds 값을 포함하는 옵션.
   * @returns {string | Buffer} 생성된 salt 또는 제공된 salt 값.
   *
   * @example
   * const salt = service.getSalt({ rounds: 10 });
   */
  private getSalt(options?: BcryptOptions) {
    let salt: string | Buffer;
    if (options?.salt) {
      salt = options.salt;
    } else if (!options?.salt && options?.rounds) {
      salt = this.bcrypt.genSaltSync(options?.rounds);
    } else {
      salt = this.bcrypt.genSaltSync();
    }

    return salt;
  }
}

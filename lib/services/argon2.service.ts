import { Injectable } from '@nestjs/common';
import type Argon2 from 'argon2';
import * as argon2 from 'argon2';
import { IHashBinService } from './hashbin.service';

export type Argon2Options = Argon2.Options;

/**
 * Argon2Service
 *
 * Argon2 해싱 알고리즘을 이용하여 데이터의 해싱 및 검증 기능을 제공합니다.
 * - 비밀번호 및 민감한 데이터를 안전하게 처리할 수 있도록 설계되었습니다.
 * - 주입된 옵션을 통해 유연한 구성이 가능합니다.
 *
 * @class Argon2Service
 * @implements {IHashable}
 */
@Injectable()
export class Argon2Service implements IHashBinService {
  private argon2!: typeof Argon2;

  constructor(private readonly options?: Argon2Options) {
    this.argon2 = argon2;
  }

  /**
   * 데이터를 Argon2 알고리즘으로 해싱합니다.
   *
   * @param {string | Buffer} data - 해싱할 원본 데이터.
   * @param {Argon2Options} [options] - 사용자 정의 옵션 (선택 사항).
   * @returns {Promise<string>} 해싱된 결과 문자열.
   *
   * @example
   * // 기본 설정으로 해싱
   * const hashed = await service.hash('myPassword');
   *
   * @example
   * // 사용자 정의 옵션을 적용한 해싱
   * const hashed = await service.hash('myPassword', { memoryCost: 8192 });
   */
  async hash(data: string | Buffer, options: Argon2Options = {}): Promise<string> {
    if (options != null) {
      return await this.argon2.hash(data, options);
    } else if (this.options) {
      return await this.argon2.hash(data, this.options);
    }

    return await this.argon2.hash(data);
  }

  /**
   * 주어진 데이터와 해시 값을 비교합니다.
   *
   * @param {string | Buffer} data - 원본 데이터.
   * @param {string} encrypted - 비교할 해시 값.
   * @param {Argon2Options} [options] - 사용자 정의 옵션 (선택 사항).
   * @returns {Promise<boolean>} 두 값이 일치하면 true, 그렇지 않으면 false.
   *
   * @example
   * // 기본 설정으로 비교
   * const isMatch = await service.compare('myPassword', hashedPassword);
   *
   * @example
   * // 사용자 정의 옵션을 적용한 비교
   * const isMatch = await service.compare('myPassword', hashedPassword, { memoryCost: 8192 });
   */
  compare(data: string | Buffer, encrypted: string, options: Argon2Options = {}): Promise<boolean> {
    if (options != null) {
      return this.argon2.verify(encrypted, data, options);
    } else if (this.options) {
      return this.argon2.verify(encrypted, data, this.options);
    }

    return this.argon2.verify(encrypted, data);
  }
}

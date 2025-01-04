import { Injectable } from '@nestjs/common';
import { bindNodeCallback, lastValueFrom } from 'rxjs';
import type Crypto from 'crypto';
import * as crypto from 'crypto';
import { IHashBinService } from './hashbin.service';

/**
 * PBKDF2 (Password-Based Key Derivation Function 2) 알고리즘에 대한 옵션을 정의하는 타입.
 * 이 타입은 비밀번호 기반 키 생성 시 사용할 수 있는 다양한 설정을 포함합니다.
 */
export type Pbkdf2Options = {
  /**
   * PBKDF2 알고리즘에서 사용할 salt 값.
   * `string` 또는 `Buffer` 타입으로 지정할 수 있습니다.
   * 기본적으로 salt 값은 랜덤하게 생성되며, 보안을 강화하는 데 중요합니다.
   */
  salt?: string | Buffer;

  /**
   * PBKDF2 알고리즘의 반복 횟수.
   * 반복 횟수가 많을수록 계산 비용이 증가하지만 보안이 강화됩니다.
   * 기본값은 보통 1000번 정도로 설정됩니다.
   */
  iterations?: number;

  /**
   * 생성될 키의 길이 (바이트 단위).
   * 생성될 키의 크기를 정의하며, 보통 256비트나 512비트로 설정합니다.
   * 기본값은 구현에 따라 다를 수 있습니다.
   */
  keylen?: number;

  /**
   * 해시 함수의 종류.
   * 사용 가능한 해시 함수는 `'sha1'`, `'sha256'`, `'sha512'` 등이 있으며,
   * 문자열로 다른 해시 알고리즘을 지정할 수도 있습니다.
   * 기본값은 `'sha256'`입니다.
   */
  digest?: 'sha1' | 'sha256' | 'sha512' | string;
};

/**
 * Pbkdf2Strategy
 *
 * PBKDF2 해싱 알고리즘을 사용하여 데이터를 해싱 및 검증하는 기능을 제공합니다.
 * - 비밀번호 보호 및 키 파생을 위해 안전한 해싱을 수행합니다.
 * - 기본 설정을 제공하지만, 사용자 정의 옵션을 지원하여 유연하게 구성할 수 있습니다.
 *
 * @reference https://nodejs.org/api/crypto.html#cryptopbkdf2password-salt-iterations-keylen-digest-callback
 *
 * @class Pbkdf2Strategy
 * @implements {IHashable}
 */
@Injectable()
export class Pbkdf2Strategy implements IHashBinService {
  private crypto!: typeof Crypto;

  /**
   * Pbkdf2Strategy 생성자
   *
   * PBKDF2 해싱 알고리즘에 대한 기본 옵션을 설정합니다.
   *
   * @param {Pbkdf2Options} [options] - 기본 해싱 옵션 (salt, iterations, keylen, digest 등).
   * @example
   * const options: Pbkdf2Options = { salt: 'mysalt', iterations: 1000 };
   * const service = new Pbkdf2Strategy(options);
   */
  constructor(private readonly options?: Pbkdf2Options) {
    this.crypto = crypto;

    // 기본 옵션 설정 (필수 값 제공)
    if (!this.options) {
      this.options = {
        salt: this.crypto.randomBytes(16), // 기본 salt 값
        iterations: 1000,
        keylen: 64,
        digest: 'sha256',
      };
    }
  }

  /**
   * 데이터를 PBKDF2 알고리즘으로 해싱합니다.
   *
   * @param {string | Buffer} data - 해싱할 원본 데이터.
   * @param {Pbkdf2Options} [options] - 사용자 정의 옵션 (salt, iterations 등).
   * @returns {Promise<string>} 해싱된 문자열을 base64로 반환합니다.
   *
   * @example
   * const hashed = await service.hash('myPassword');
   *
   * @example
   * const hashed = await service.hash('myPassword', { iterations: 2000 });
   */
  async hash(data: string | Buffer, options: Pbkdf2Options = {}): Promise<string> {
    const { salt, iterations, keylen, digest } = this.getFinalOptions(options);

    // pbkdf2 해싱 비동기 처리
    const hashedData = bindNodeCallback(this.crypto.pbkdf2.bind(this.crypto))(
      data,
      salt,
      iterations,
      keylen,
      digest,
    );

    // 결과 값을 base64 문자열로 반환
    return (await lastValueFrom(hashedData)).toString('base64');
  }

  /**
   * 원본 데이터와 해싱된 값이 일치하는지 비교합니다.
   *
   * @param {string | Buffer} data - 비교할 원본 데이터.
   * @param {string | Buffer} hashed - 비교할 해시 문자열.
   * @param {Pbkdf2Options} [options] - 해싱에 사용된 옵션 (salt, iterations 등).
   * @returns {Promise<boolean>} 일치 여부 (true 또는 false).
   *
   * @example
   * const isMatch = await service.compare('myPassword', hashedValue);
   */
  async compare(
    data: string | Buffer,
    hashed: string | Buffer,
    options: Pbkdf2Options = this.options || {},
  ): Promise<boolean> {
    const { salt, iterations, keylen, digest } = this.getFinalOptions(options);

    // 원본 데이터를 동일 옵션으로 해싱 후 비교
    const hashedData = await this.hash(data, {
      salt,
      iterations,
      keylen,
      digest,
    });
    return hashedData === hashed.toString('base64');
  }

  /**
   * 최종 해싱 옵션을 결정합니다.
   *
   * @param {Pbkdf2Options} options - 사용자 정의 옵션.
   * @returns {{
   *   salt: string | Buffer;
   *   iterations: number;
   *   keylen: number;
   *   digest: string;
   * }} 병합된 최종 옵션 객체.
   *
   * @example
   * const finalOptions = service.getFinalOptions({ iterations: 2000 });
   */
  private getFinalOptions(options: Pbkdf2Options) {
    // 옵션이 없을 경우 기본값 적용
    return {
      salt: options.salt ?? this.options?.salt,
      iterations: options.iterations ?? this.options?.iterations,
      keylen: options.keylen ?? this.options?.keylen,
      digest: options.digest ?? this.options?.digest,
    } as {
      salt: string | Buffer;
      iterations: number;
      keylen: number;
      digest: string;
    };
  }
}

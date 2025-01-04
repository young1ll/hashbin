import { Injectable } from '@nestjs/common';
import type Crypto from 'crypto';
import * as crypto from 'crypto';

export type RsaPemOptions = Crypto.RSAKeyPairOptions<'pem', 'pem'>;

/**
 * RsaService
 *
 * RSA 알고리즘을 사용하여 데이터를 안전하게 암호화 및 복호화하는 서비스입니다.
 * - 공개키를 사용하여 데이터를 암호화하고, 개인키를 사용하여 복호화합니다.
 * - RSA 키 쌍을 생성하는 기능을 제공합니다.
 *
 * @class RsaService
 */
@Injectable()
export class RsaService {
  crypto!: typeof Crypto;

  constructor(private readonly options?: RsaPemOptions) {
    this.crypto = crypto;
  }

  /**
   * RSA 키 쌍을 생성합니다.
   *
   * @param {RsaPemOptions} [options] - 사용자 정의 옵션 (선택 사항).
   * @returns {crypto.KeyPairSyncResult<string, string>} 생성된 공개키와 개인키.
   *
   * @example
   * const { publicKey, privateKey } = service.generateKeyPair();
   */
  generateKeyPair(options?: RsaPemOptions): crypto.KeyPairSyncResult<string, string> {
    const { modulusLength, publicKeyEncoding, privateKeyEncoding } = this.getFinalOptions(options);

    // RSA 키 쌍 생성
    return this.crypto.generateKeyPairSync('rsa', {
      modulusLength,
      publicKeyEncoding,
      privateKeyEncoding,
    });
  }

  /**
   * 데이터를 공개키로 암호화합니다.
   *
   * @param {string | Buffer} data - 암호화할 원본 데이터.
   * @param {string} publicKey - 암호화에 사용할 공개키.
   * @returns {string} base64로 인코딩된 암호화된 데이터.
   * @throws {Error} 암호화 실패 시 예외 발생.
   *
   * @example
   * const encrypted = service.encrypt('mySecretData', publicKey);
   */
  encrypt(data: string | Buffer, publicKey: string) {
    try {
      const encrypted = this.crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(data),
      );

      return encrypted.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * 암호화된 데이터를 개인키로 복호화합니다.
   *
   * @param {string} encryptedData - 암호화된 base64 문자열.
   * @param {string} privateKey - 복호화에 사용할 개인키.
   * @returns {string} 복호화된 원본 데이터.
   * @throws {Error} 복호화 실패 시 예외 발생.
   *
   * @example
   * const decrypted = service.decrypt(encryptedData, privateKey);
   */
  decrypt(encryptedData: string, privateKey: string): string {
    try {
      const decrypted = this.crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(encryptedData, 'base64'),
      );

      // console.log(decrypted);

      return decrypted.toString();
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * 최종 RSA 옵션을 결정합니다.
   *
   * 사용자 정의 옵션과 기본 옵션을 병합하여 최종 설정을 반환합니다.
   *
   * @param {RsaPemOptions} options - 사용자 정의 옵션.
   * @returns {Crypto.RSAKeyPairOptions<'pem', 'pem'>} 최종 옵션.
   *
   * @example
   * const options = service.getFinalOptions({ keySize: 4096 });
   */
  private getFinalOptions(options: RsaPemOptions): Crypto.RSAKeyPairOptions<'pem', 'pem'> {
    return {
      modulusLength: 2048,
      publicKeyEncoding: options.publicKeyEncoding ||
        this.options?.publicKeyEncoding || {
          type: 'spki',
          format: 'pem',
        },
      privateKeyEncoding: options.privateKeyEncoding ||
        this.options?.privateKeyEncoding || {
          type: 'pkcs8',
          format: 'pem',
          // cipher: 'aes-256-cbc', 개인키를 복호화 할 때 비밀키를 요구할 것인가?
          // passphrase: this.options?.secret,
        },
    };
  }
}

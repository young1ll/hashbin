import { Test, TestingModule } from '@nestjs/testing';

import { HASH_PROVIDER_OPTIONS, RsaService } from '../../lib';

describe('RsaService', () => {
  let rsaService: RsaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RsaService,
        {
          provide: HASH_PROVIDER_OPTIONS,
          useValue: {
            keySize: 2048,
          },
        },
      ],
    }).compile();

    rsaService = module.get<RsaService>(RsaService);
  });

  it('should encrypt and decrypt data correctly', () => {
    const data = 'Hello, RSA!';
    const { publicKey, privateKey } = rsaService.generateKeyPair();

    // 암호화
    const encryptedData = rsaService.encrypt(data, publicKey);
    expect(encryptedData).toBeDefined();

    // 복호화
    const decryptedData = rsaService.decrypt(encryptedData, privateKey);
    expect(decryptedData).toEqual(data);
  });

  it('should return an error when decryption fails with invalid private key', () => {
    const data = 'Hello, RSA!';

    // RSA 키쌍 생성
    const { publicKey } = rsaService.generateKeyPair();

    // 잘못된 개인 키
    const fakePrivateKey = 'fake-private-key';

    // 암호화
    const encryptedData = rsaService.encrypt(data, publicKey);
    expect(encryptedData).toBeDefined();

    // 복호화
    try {
      rsaService.decrypt(encryptedData, fakePrivateKey);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});

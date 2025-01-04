import { Test, TestingModule } from '@nestjs/testing';

import { HASH_PROVIDER_OPTIONS, Pbkdf2Service } from '../../lib';
import { Pbkdf2Options } from '../../lib/interfaces/options';

describe('Pbkdf2Service', () => {
  let service: Pbkdf2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Pbkdf2Service,
        {
          provide: HASH_PROVIDER_OPTIONS,
          useValue: {
            salt: Buffer.from('defaultSalt'), // 기본 salt
            iterations: 1000,
            keylen: 64,
            digest: 'sha256',
          } as Pbkdf2Options,
        },
      ],
    }).compile();

    service = module.get<Pbkdf2Service>(Pbkdf2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should hash the data with provided options', async () => {
      const data = 'test-data';
      const options: Pbkdf2Options = {
        salt: Buffer.from('customSalt'),
        iterations: 2000,
        keylen: 32,
        digest: 'sha256',
      };

      const hashed = await service.hash(data, options);

      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
    });

    it('should hash the data with default options if none are provided', async () => {
      const data = 'test-data';

      const hashed = await service.hash(data);
      // console.log(hashed);

      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
    });

    it('should produce different hashes for different salts', async () => {
      const data = 'test-data';
      const hash1 = await service.hash(data, { salt: Buffer.from('salt1') });
      const hash2 = await service.hash(data, { salt: Buffer.from('salt2') });

      expect(hash1).not.toEqual(hash2);
    });
  });

  describe('compare', () => {
    it('should return true for matching data and hash', async () => {
      const data = 'test-data';
      const options: Pbkdf2Options = {
        salt: Buffer.from('testSalt'),
        iterations: 1000,
        keylen: 64,
        digest: 'sha256',
      };

      const hashed = await service.hash(data, options);
      const result = await service.compare(data, hashed, options);

      expect(result).toBe(true);
    });

    it('should return false for non-matching data and hash', async () => {
      const data = 'test-data';
      const options: Pbkdf2Options = {
        salt: Buffer.from('testSalt'),
        iterations: 1000,
        keylen: 64,
        digest: 'sha256',
      };

      const hashed = await service.hash(data, options);
      const result = await service.compare('wrong-data', hashed, options);

      expect(result).toBe(false);
    });

    it('should use default options for comparison if none are provided', async () => {
      const data = 'test-data';

      const hashed = await service.hash(data);
      const result = await service.compare(data, hashed);

      expect(result).toBe(true);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';

import { HASH_PROVIDER_OPTIONS, Argon2Service } from '../../lib';

describe('Argon2Service', () => {
  let service: Argon2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Argon2Service,
        {
          provide: HASH_PROVIDER_OPTIONS,
          useValue: { memoryCost: 2 ** 16, timeCost: 5, parallelism: 2 }, // Argon2 옵션
        },
      ],
    }).compile();

    service = module.get<Argon2Service>(Argon2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should hash the data with provided options', async () => {
      const data = 'test-data';
      const options = { memoryCost: 2 ** 15, timeCost: 3, parallelism: 1 };
      const hashed = await service.hash(data, options);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(data);
      expect(hashed).toContain('$argon2'); // Argon2 해시의 일반적인 포맷 확인
    });

    it('should hash the data with global options if no specific options are provided', async () => {
      const data = 'test-data';
      const hashed = await service.hash(data);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(data);
      expect(hashed).toContain('$argon2'); // Argon2 해시 포맷 확인
    });
  });

  describe('compare', () => {
    it('should return true for matching data and hash', async () => {
      const data = 'test-data';
      const hashed = await service.hash(data);

      const result = await service.compare(data, hashed);
      expect(result).toBe(true);
    });

    it('should return false for non-matching data and hash', async () => {
      const data = 'test-data';
      const hashed = await service.hash(data);

      const result = await service.compare('wrong-data', hashed);
      expect(result).toBe(false);
    });

    it('should use provided options for comparison', async () => {
      const data = 'test-data';
      const options = { memoryCost: 2 ** 15, timeCost: 3, parallelism: 1 };
      const hashed = await service.hash(data, options);

      const result = await service.compare(data, hashed, options);
      expect(result).toBe(true);
    });
  });
});

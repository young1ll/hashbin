import { Test, TestingModule } from '@nestjs/testing';

import { HASH_PROVIDER_OPTIONS, BcryptService } from '../../lib';

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BcryptService,
        {
          provide: HASH_PROVIDER_OPTIONS,
          useValue: { rounds: 10 }, // 기본 옵션 설정
        },
      ],
    }).compile();

    service = module.get<BcryptService>(BcryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should hash the data with auto-generated salt', async () => {
      const data = 'test-data';
      const hashed = await service.hash(data);
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(data);
    });

    it('should hash the data with provided salt rounds', async () => {
      const data = 'test-data';
      const hashed = await service.hash(data, { rounds: 8 });
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(data);
    });

    it('should hash the data with provided salt', async () => {
      const data = 'test-data';
      const salt = await service['bcrypt'].genSalt(10);
      const hashed = await service.hash(data, { salt });
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(data);
    });
  });

  describe('hashSync', () => {
    it('should hash the data synchronously', () => {
      const data = 'test-data';
      const hashed = service.hashSync(data, { rounds: 10 });
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(data);
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
  });

  describe('compareSync', () => {
    it('should return true for matching data and hash (sync)', () => {
      const data = 'test-data';
      const hashed = service.hashSync(data, { rounds: 10 });
      const result = service.compareSync(data, hashed);
      expect(result).toBe(true);
    });

    it('should return false for non-matching data and hash (sync)', () => {
      const data = 'test-data';
      const hashed = service.hashSync(data, { rounds: 10 });
      const result = service.compareSync('wrong-data', hashed);
      expect(result).toBe(false);
    });
  });
});

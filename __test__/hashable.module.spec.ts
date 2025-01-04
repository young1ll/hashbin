import { Test, TestingModule } from '@nestjs/testing';
import { DynamicModule } from '@nestjs/common';

import {
  HashBinModule,
  HASH_PROVIDER_OPTIONS,
  HashType,
  Argon2Service,
  BcryptService,
  Pbkdf2Service,
} from '../lib';
import { HashingModuleOptions } from '../lib/interfaces/options';

describe('HashableModule', () => {
  let module: TestingModule;

  /**
   * 기본 모듈 설정 테스트
   */
  describe('register()', () => {
    it('기본 설정으로 모듈을 동적으로 생성해야 합니다.', async () => {
      const dynamicModule: DynamicModule = HashBinModule.register();

      // 기본 옵션 검증
      expect(dynamicModule.global).toBe(false); // 전역 모듈 여부 기본값: false
      expect(dynamicModule.module).toBe(HashBinModule);
      expect(dynamicModule.providers).toBeDefined();
      expect(dynamicModule.exports).toBeDefined();
    });

    it('전역 모듈로 등록할 수 있어야 합니다.', async () => {
      const dynamicModule: DynamicModule = HashBinModule.register({
        isGlobal: true,
      });

      // 전역 옵션 설정 검증
      expect(dynamicModule.global).toBe(true);
    });
  });

  /**
   * 프로바이더 주입 테스트
   */
  describe('providers', () => {
    let bcryptService: BcryptService;
    let argon2Service: Argon2Service;
    let pbkdf2Service: Pbkdf2Service;

    beforeEach(async () => {
      const dynamicModule = HashBinModule.register({
        hashingOptions: {
          bcrypt: { rounds: 10 },
          argon2: { memoryCost: 8192 },
          pbkdf2: { iterations: 1000, keylen: 64, digest: 'sha256' },
        },
      });

      module = await Test.createTestingModule({
        imports: [dynamicModule],
      }).compile();

      bcryptService = module.get<BcryptService>(HashType.Bcrypt);
      argon2Service = module.get<Argon2Service>(HashType.Argon2);
      pbkdf2Service = module.get<Pbkdf2Service>(HashType.Pbkdf2);
    });

    it('BcryptService를 주입받을 수 있어야 합니다.', () => {
      expect(bcryptService).toBeInstanceOf(BcryptService); // BcryptService 검증
    });

    it('Argon2Service를 주입받을 수 있어야 합니다.', () => {
      expect(argon2Service).toBeInstanceOf(Argon2Service); // Argon2Service 검증
    });

    it('Pbkdf2Service를 주입받을 수 있어야 합니다.', () => {
      expect(pbkdf2Service).toBeInstanceOf(Pbkdf2Service); // Pbkdf2Service 검증
    });
  });

  /**
   * 옵션 처리 테스트
   */
  describe('options handling', () => {
    beforeEach(async () => {
      const dynamicModule = HashBinModule.register({
        hashingOptions: {
          bcrypt: { rounds: 12 },
        },
      });

      module = await Test.createTestingModule({
        imports: [dynamicModule],
      }).compile();
    });

    it('HASH_PROVIDER_OPTIONS에 옵션이 주입되어야 합니다.', () => {
      const options = module.get<HashingModuleOptions['hashingOptions']>(HASH_PROVIDER_OPTIONS);

      expect(options).toBeDefined(); // 옵션 정의 검증
      expect(options.bcrypt?.rounds).toBe(12); // bcrypt 옵션 검증
    });
  });
});

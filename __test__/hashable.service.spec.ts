import { Test, TestingModule } from '@nestjs/testing';
import { DynamicModule } from '@nestjs/common';

import {
  HashableModule,
  HashType,
  Argon2Service,
  BcryptService,
  Pbkdf2Service,
} from '../lib';

describe('HashableModule', () => {
  let module: TestingModule;

  /**
   * 기본 모듈 설정 테스트
   */
  describe('register()', () => {
    it('기본 설정으로 모듈을 동적으로 생성합니다.', async () => {
      const dynamicModule: DynamicModule = HashableModule.register();
      expect(dynamicModule.module).toBe(HashableModule);
      expect(dynamicModule.providers).toBeDefined();
      expect(dynamicModule.exports).toBeDefined();
    });

    it('전역 모듈로 등록할 수 있습니다.', async () => {
      const dynamicModule: DynamicModule = HashableModule.register({
        isGlobal: true,
      });
      expect(dynamicModule.global).toBe(true);
    });
  });

  /**
   * 프로바이더 및 의존성 주입 테스트
   */
  describe('providers', () => {
    let bcryptService: BcryptService;
    let argon2Service: Argon2Service;
    let pbkdf2Service: Pbkdf2Service;

    beforeEach(async () => {
      const dynamicModule = HashableModule.register({
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

    it('BcryptService를 주입받을 수 있습니다.', () => {
      expect(bcryptService).toBeInstanceOf(BcryptService);
    });

    it('Argon2Service를 주입받을 수 있습니다.', () => {
      expect(argon2Service).toBeInstanceOf(Argon2Service);
    });

    it('Pbkdf2Service를 주입받을 수 있습니다.', () => {
      expect(pbkdf2Service).toBeInstanceOf(Pbkdf2Service);
    });
  });

  /**
   * 옵션 처리 테스트
   */
  describe('options handling', () => {
    let bcryptService: BcryptService;

    beforeEach(async () => {
      // 동적 모듈 등록
      const dynamicModule = HashableModule.register({
        hashingOptions: {
          bcrypt: { rounds: 12 }, // bcrypt 옵션 전달
        },
      });

      // 테스트 모듈 생성
      module = await Test.createTestingModule({
        imports: [dynamicModule], // 동적 모듈 임포트
      }).compile();

      // BcryptService 주입
      bcryptService = module.get<BcryptService>(HashType.Bcrypt);
    });

    it('BcryptService에서 HASH_PROVIDER_OPTIONS를 통해 옵션을 사용할 수 있습니다.', () => {
      // bcryptService의 기본 옵션 확인
      const options = (bcryptService as any).options;
      expect(options.bcrypt).toBeDefined(); // 옵션 정의 확인
      expect(options.bcrypt.rounds).toBe(12); // 옵션 값 검증
    });
  });
});

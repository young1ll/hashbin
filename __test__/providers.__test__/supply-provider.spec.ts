import { Test, TestingModule } from '@nestjs/testing';
import { Provider } from '@nestjs/common';
import {
  HASH_PROVIDER_OPTIONS,
  Argon2Service,
  BcryptService,
  createHashProviders,
  Hashable,
  Pbkdf2Service,
  HashType,
} from '../../lib';
import { HashingModuleOptions } from '../../lib/interfaces/options';

describe('createHashProviders', () => {
  let module: TestingModule;

  /**
   * 기본 프로바이더 테스트
   */
  describe('Provider registration', () => {
    beforeEach(async () => {
      // 기본 옵션으로 모듈 생성
      const providers = createHashProviders({
        hashingOptions: {
          bcrypt: { rounds: 10 },
          argon2: { memoryCost: 8192 },
          pbkdf2: { iterations: 1000, keylen: 64, digest: 'sha256' },
        },
      });

      module = await Test.createTestingModule({
        providers, // 동적 프로바이더 추가
      }).compile();
    });

    /**
     * HASH_PROVIDER_OPTIONS 테스트
     */
    it('HASH_PROVIDER_OPTIONS이 주입되어야 합니다.', () => {
      const options = module.get(
        HASH_PROVIDER_OPTIONS,
      ) as HashingModuleOptions['hashingOptions'];
      expect(options).toBeDefined(); // 옵션 존재 여부 확인
      console.log(options);
      expect(options?.bcrypt?.rounds).toBe(10); // bcrypt 옵션 확인
    });

    /**
     * 정적 프로바이더 테스트
     */
    it('BcryptService가 등록되어야 합니다.', () => {
      const bcryptService = module.get<BcryptService>(HashType.Bcrypt);
      expect(bcryptService).toBeInstanceOf(BcryptService); // BcryptService 인스턴스 확인
    });

    it('Argon2Service가 등록되어야 합니다.', () => {
      const argon2Service = module.get<Argon2Service>(HashType.Argon2);
      expect(argon2Service).toBeInstanceOf(Argon2Service); // Argon2Service 인스턴스 확인
    });

    it('Pbkdf2Service가 등록되어야 합니다.', () => {
      const pbkdf2Service = module.get<Pbkdf2Service>(HashType.Pbkdf2);
      expect(pbkdf2Service).toBeInstanceOf(Pbkdf2Service); // Pbkdf2Service 인스턴스 확인
    });

    /**
     * 동적 프로바이더 테스트
     */
    it('HASHABLE_Bcrypt 프로바이더가 동적으로 생성되어야 합니다.', async () => {
      const hashable = await module.resolve<Hashable<'bcrypt'>>(
        `HASHABLE_${HashType.Bcrypt}`,
      );
      expect(hashable).toBeInstanceOf(Hashable); // Hashable 인스턴스 확인
    });

    it('HASHABLE_Argon2 프로바이더가 동적으로 생성되어야 합니다.', async () => {
      const hashable = await module.resolve<Hashable<'argon2'>>(
        `HASHABLE_${HashType.Argon2}`,
      );
      expect(hashable).toBeInstanceOf(Hashable); // Hashable 인스턴스 확인
    });

    it('HASHABLE_Pbkdf2 프로바이더가 동적으로 생성되어야 합니다.', async () => {
      const hashable = await module.resolve<Hashable<'pbkdf2'>>(
        `HASHABLE_${HashType.Pbkdf2}`,
      );
      expect(hashable).toBeInstanceOf(Hashable); // Hashable 인스턴스 확인
    });
  });

  /**
   * 동적 프로바이더 옵션 테스트
   */
  describe('Dynamic provider options', () => {
    beforeEach(async () => {
      const providers: Provider[] = createHashProviders({
        hashingOptions: {
          bcrypt: { rounds: 12 }, // 옵션 전달
        },
      });

      module = await Test.createTestingModule({
        providers,
      }).compile();
    });

    it('BcryptService가 옵션을 적용해야 합니다.', () => {
      const bcryptService = module.get<BcryptService>(HashType.Bcrypt);
      const options = (bcryptService as any).options; // private 접근을 위해 강제 타입 변환
      expect(options.bcrypt.rounds).toBe(12); // 옵션 값 검증
    });
  });
});

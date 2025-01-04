import { Test, TestingModule } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { HashType, HashWith } from '../lib';

// 가짜 서비스
@Injectable()
class MockBcryptService {
  hash(data: string): string {
    return `hashed-${data}`;
  }
}

// 데코레이터 테스트를 위한 모의 클래스
@Injectable()
class TestService {
  // HashWith 데코레이터를 사용한 주입 예제
  constructor(
    @HashWith(HashType.Bcrypt) public hashService: MockBcryptService,
  ) {}
}

describe('HashWith Decorator', () => {
  let testService: TestService;

  beforeEach(async () => {
    // 테스트 모듈 생성
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestService,
        // 의존성 주입 설정
        {
          provide: `HASHABLE_${HashType.Bcrypt}`,
          useClass: MockBcryptService,
        },
      ],
    }).compile();

    testService = module.get<TestService>(TestService);
  });

  it('BcryptService가 주입되어야 합니다.', () => {
    expect(testService.hashService).toBeDefined(); // 서비스 정의 확인
    expect(testService.hashService).toBeInstanceOf(MockBcryptService); // MockBcryptService 인스턴스 확인
  });

  it('BcryptService의 hash 메서드가 올바르게 동작해야 합니다.', () => {
    const result = testService.hashService.hash('testData');
    expect(result).toBe('hashed-testData'); // 해시 결과 검증
  });
});

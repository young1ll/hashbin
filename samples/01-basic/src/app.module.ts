import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BcryptService, HashBinModule } from '@zeroplate/hashable';

@Module({
  imports: [
    HashBinModule.register({
      isGlobal: true,
    }),
  ],
  providers: [
    AppService,
    {
      provide: 'HASH_STRATEGY',
      useClass: BcryptService,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}

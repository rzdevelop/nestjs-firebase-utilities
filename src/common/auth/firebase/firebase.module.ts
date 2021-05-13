import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CustomLoggerModule, CustomLogger } from 'nestjs-utilities';
import { FirebaseService, IFirebaseOptions } from './firebase.service';

@Module({})
export class FirebaseModule {
  static register(options: IFirebaseOptions): DynamicModule {
    return {
      module: FirebaseModule,
      imports: [PassportModule, CustomLoggerModule.register()],
      providers: [
        {
          provide: FirebaseService,
          useFactory: (logger: CustomLogger): FirebaseService => new FirebaseService(logger, options),
          inject: [CustomLogger],
        },
      ],
      exports: [FirebaseService],
    };
  }
}

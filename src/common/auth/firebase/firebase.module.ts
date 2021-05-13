import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CustomLoggerModule, CustomLogger } from 'nestjs-utilities';
import { FirebaseAppOptions, FirebaseModuleAsyncOptions } from './firebase.interface';
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

  static registerAsync(options: FirebaseModuleAsyncOptions): DynamicModule {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const defaultFn = (): void => {};
    const optionsProvider: Provider = {
      provide: 'FirebaseModuleAsyncOptions',
      useFactory: options.useFactory || defaultFn,
      inject: options.inject || [],
    };

    return {
      module: FirebaseModule,
      imports: [PassportModule, CustomLoggerModule.register(), ...(options.imports || [])],
      providers: [
        optionsProvider,
        {
          provide: FirebaseService,
          useFactory: (logger: CustomLogger, opts: FirebaseAppOptions): FirebaseService => {
            logger.info('options', opts);
            return new FirebaseService(logger, { getOptions: (): FirebaseAppOptions => opts });
          },
          inject: [CustomLogger, 'FirebaseModuleAsyncOptions'],
        },
      ],
      exports: [optionsProvider, FirebaseService],
    };
  }
}

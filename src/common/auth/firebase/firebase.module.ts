import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CustomLoggerModule } from 'nestjs-utilities';
import { FirebaseService } from './firebase.service';

@Module({})
export class FirebaseModule {
  register(): DynamicModule {
    return {
      module: FirebaseModule,
      imports: [PassportModule, CustomLoggerModule.register()],
      providers: [FirebaseService],
      exports: [FirebaseService],
    };
  }
}

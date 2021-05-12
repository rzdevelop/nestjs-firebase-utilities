import { AppOptions, ServiceAccount, auth } from 'firebase-admin';
import { JwtFromRequestFunction } from 'passport-jwt';
import { CustomLogger } from 'nestjs-utilities';

export interface FirebaseAuthStrategyOptions {
  extractor: JwtFromRequestFunction;
  getOptions: () => FirebaseAppOptions | Promise<FirebaseAppOptions>;
  logger: CustomLogger;
}

export type FirebaseDecodedToken = auth.DecodedIdToken;
export type FirebaseAppOptions = AppOptions;
export type FirebaseServiceAccount = ServiceAccount;

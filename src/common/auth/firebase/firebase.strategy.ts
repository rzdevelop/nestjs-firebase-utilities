import { Request } from 'express';
import * as admin from 'firebase-admin';
import { CustomLogger } from 'nestjs-utilities';
import { JwtFromRequestFunction } from 'passport-jwt';
import { Strategy } from 'passport-strategy';

import { HttpStatus, Injectable } from '@nestjs/common';

import { FirebaseAppOptions, FirebaseAuthStrategyOptions, FirebaseDecodedToken } from './firebase.interface';

@Injectable()
export class FirebaseStrategy extends Strategy {
  extractor: JwtFromRequestFunction;
  getOptions: () => Promise<FirebaseAppOptions> | FirebaseAppOptions;
  logger: CustomLogger;

  constructor({ extractor, getOptions, logger }: FirebaseAuthStrategyOptions) {
    super();

    if (!extractor) {
      throw new Error('Extractor is not a function. You should provide an extractor.');
    }
    if (!getOptions) {
      throw new Error('You should provide an function tp get the options.');
    }
    this.logger = logger;
    this.logger.setContext(FirebaseStrategy.name);

    this.extractor = extractor;
    this.getOptions = getOptions;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(payload: FirebaseDecodedToken): Promise<any> {
    return payload;
  }

  async authenticate(req: Request): Promise<void> {
    const idToken = this.extractor(req);

    if (!idToken) {
      this.fail('Unauthorized', HttpStatus.UNAUTHORIZED);

      return;
    }

    try {
      return this.initializeApp().then(() =>
        admin
          .auth()
          .verifyIdToken(idToken)
          .then((token) => this.validateDecodedIdToken(token))
          .catch((err) => {
            this.logger.error(err.message, err.trace);
            this.fail({ err }, HttpStatus.UNAUTHORIZED);
          }),
      );
    } catch (e) {
      this.logger.error(e, e.trace);

      this.fail(e, HttpStatus.UNAUTHORIZED);
    }
  }

  async initializeApp(): Promise<void> {
    if (admin.apps.length === 0) {
      const options = await this.getOptions();
      admin.initializeApp(options);
    }
  }

  private async validateDecodedIdToken(decodedIdToken: FirebaseDecodedToken): Promise<void> {
    const result = await this.validate(decodedIdToken);

    if (result) {
      this.success(result);
    }

    this.fail('Unauthorized', HttpStatus.UNAUTHORIZED);
  }
}

import * as admin from 'firebase-admin';
import { CustomLogger } from 'nestjs-utilities';

import { Inject, Injectable } from '@nestjs/common';
import { FirebaseAppOptions } from './firebase.interface';

export type UserRecord = admin.auth.UserRecord;
export type ListUsersResult = admin.auth.ListUsersResult;
export interface IFirebaseOptions {
  getOptions: () => Promise<FirebaseAppOptions> | FirebaseAppOptions;
}

@Injectable()
export class FirebaseService {
  private auth: admin.auth.Auth;

  constructor(
    private readonly logger: CustomLogger,
    @Inject('IFirebaseOptions') private readonly firebaseOptions: IFirebaseOptions,
  ) {
    this.logger.setContext(FirebaseService.name);
    this.logger.info('firebaseOptions', firebaseOptions);
    this.initializeApp().then(() => {
      this.logger.log('finito ');
      this.auth = admin.auth();
    });
  }

  private async initializeApp(): Promise<void> {
    this.logger.log('opts');
    if (admin.apps.length === 0) {
      const options = await this.firebaseOptions.getOptions();
      this.logger.info('options', options);
      admin.initializeApp(options);
    }
  }

  getAllUsers(maxResults?: number, nextPageToken?: string): Promise<admin.auth.ListUsersResult> {
    return this.auth.listUsers(maxResults, nextPageToken);
  }

  async createUser(email: string): Promise<UserRecord> {
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) return existingUser;

    const user = await this.auth.createUser({
      email,
    });

    const link = await this.auth.generatePasswordResetLink(email);
    this.logger.info('Password generated link', { link });

    return user;
  }

  async getUserByEmail(email: string): Promise<UserRecord | undefined> {
    return this.auth
      .getUserByEmail(email)
      .then((user) => user)
      .catch<undefined>(() => undefined);
  }

  async updateUserEmail(uid: string, email: string): Promise<UserRecord | undefined> {
    return this.auth
      .updateUser(uid, { email })
      .then((user) => user)
      .catch<undefined>(() => undefined);
  }

  deleteUser(uid: string): Promise<void> {
    return this.auth.deleteUser(uid);
  }

  async setCustomUserClaims(
    uid: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    claims: Record<string, any>,
  ): Promise<void> {
    return this.auth.setCustomUserClaims(uid, claims);
  }
}

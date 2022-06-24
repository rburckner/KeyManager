import {BehaviorSubject} from 'rxjs';
import {IKeyOptions, IUser, KeyStoreEntry} from './key-store-entry.class';

interface IKeyStore {
  entries: KeyStoreEntry[];
}

export class KeyStore implements IKeyStore {
  public readonly keyCount$ = new BehaviorSubject<number>(0);

  constructor(public entries = [] as KeyStoreEntry[]) {
  }

  get keyCount() {
    return this.keyCount$.value;
  }

  public static CreateUser(userId: IUser) {
    if (typeof userId.name !== 'string' && typeof userId.email !== 'string') {
      throw new Error('name or email parameter required');
    }
    return userId as IUser;
  }

  public async createECC_Key(opts: IKeyOptions) {
    try {
      const {entry, ...newKeyArmored} = await KeyStoreEntry.CreateECC(opts);
      this.addKey(entry);
      return newKeyArmored;
    } catch (error) {
      throw error;
    }
  }

  public async createRSA_Key(opts: IKeyOptions) {
    try {
      const {entry, ...newKeyArmored} = await KeyStoreEntry.CreateRSA(opts);
      this.addKey(entry);
      return newKeyArmored;
    } catch (error) {
      throw error;
    }
  }

  public deleteKey(fingerprint: string) {
    this.entries = this.entries.filter(
      (entry) => entry.fingerprint !== fingerprint
    );
    this.keyCount$.next(this.entries.length);
  }

  public flushEntries() {
    this.entries = [];
    this.keyCount$.next(this.entries.length);
  }

  public getKey(fingerprint: string) {
    return this.entries.filter((entry) => entry.fingerprint === fingerprint)[0];
  }

  public getProperties() {
    return Promise.all(this.entries.map((entry) => entry.getProperties()));
  }

  public async importKey(privateKeyArmored: string) {
    const key = await KeyStoreEntry.Import(privateKeyArmored)
    if (key) {
      this.addKey(key);
    }
  }

  private addKey(key: KeyStoreEntry) {
    if (
      !this.entries
        .map((entries) => entries.fingerprint)
        .includes(key.fingerprint)
    ) {
      this.entries.push(key);
      this.keyCount$.next(this.entries.length);
    }
  }
}

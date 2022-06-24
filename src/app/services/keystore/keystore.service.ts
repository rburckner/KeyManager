import {Injectable} from '@angular/core';
import {IUser} from "./key-store-entry.class";
import {KeyStore} from "./key-store.class";

@Injectable({
  providedIn: 'root'
})
export class KeystoreService {
  public keyStore = new KeyStore();

  constructor() {
  }

  get keyCount$() {
    return this.keyStore.keyCount$;
  }

  public createECC_KeyWithUser(user: IUser, passphrase?: string) {
    return this.keyStore.createECC_Key({
      userIDs: KeyStore.CreateUser(user),
      passphrase,
    });
  }

  public createRSA_KeyWithUser(user: IUser, passphrase?: string) {
    return this.keyStore.createRSA_Key({
      userIDs: KeyStore.CreateUser(user),
      passphrase,
    });
  }

  public createUser(userId: IUser) {
    return KeyStore.CreateUser(userId);
  }

  public deleteKey(fingerprint: string) {
    this.keyStore.deleteKey(fingerprint);
  }

  public getEntries() {
    return this.keyStore.entries;
  }

  public getKey(fingerprint: string) {
    return this.keyStore.getKey(fingerprint);
  }

  public getProperties() {
    return this.keyStore.getProperties();
  }
}

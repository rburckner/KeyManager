import {
  AlgorithmInfo,
  decryptKey,
  generateKey,
  KeyOptions,
  PrivateKey,
  readPrivateKey,
  SubkeyOptions,
  UserID,
} from 'openpgp';
import {BehaviorSubject, Subscription, timer} from 'rxjs';

export interface IKeyOptions extends KeyOptions {
}

export interface IKeyStoreEntry {
  privateKeyArmored: string;
}

interface IKeyStoreEntryFingerprints {
  private: string;
  signing: string;
  encryption: string;
  subkeys: string[];
}

interface IkeyStoreEntrySubKeyIds {
  private: string;
  signing: string;
  encryption: string;
  subkeys: string[];
}

export interface IKeyStoreEntryProperties {
  algorithm: AlgorithmInfo;
  fingerprints: IKeyStoreEntryFingerprints;
  locked: boolean | null;
  primaryUser: string | undefined;
  keyIds: IkeyStoreEntrySubKeyIds;
  subKeysCount: number;
}

export interface IUser extends UserID {
}

const BEGIN_STRING = '-----BEGIN PGP PRIVATE KEY BLOCK-----';
const END_STRING = '-----END PGP PRIVATE KEY BLOCK-----';
const PASSPHRASE_CACHE_DURATION_SEC = 300;
const DEFAULT_CONFIG = {showComment: true, showVersion: true};

export class KeyStoreEntry implements IKeyStoreEntry {
  public readonly locked$ = new BehaviorSubject<boolean | null>(null);
  private privateKey?: PrivateKey;
  private timer$: Subscription | undefined;

  constructor(
    public privateKeyArmored = '',
    public publicKeyArmored = '',
    public revocationCert = '',
    public fingerprint: string,
    private isDecrypted = false
  ) {
    this.locked$.next(!isDecrypted);
  }

  get locked() {
    return this.locked$.value;
  }

  get unlocked() {
    return !this.locked$.value;
  }

  static CreateECC(opts: KeyOptions) {
    return this.Create({...opts, type: 'ecc'});
  }

  static CreateRSA(opts: KeyOptions) {
    return this.Create({...opts, type: 'rsa'});
  }

  public static async Import(armoredKey: string) {
    const lines = armoredKey.split('\n')
    if (!lines.includes(BEGIN_STRING) || !lines.includes(END_STRING)) {
      return null;
    }
    const privateKey = await readPrivateKey({
      armoredKey,
    });
    return new KeyStoreEntry(
      armoredKey,
      undefined, undefined,
      privateKey.getFingerprint(),
      privateKey.isDecrypted()
    );
  }

  private static async Create(opts: KeyOptions) {
    if (!opts.subkeys || !opts.subkeys.filter((key) => key.sign).length) {
      opts.subkeys = opts.subkeys || ([] as SubkeyOptions[]);
      opts.subkeys.push({sign: true});
      opts.subkeys.push({sign: false});
    }
    opts.config = {...DEFAULT_CONFIG, ...opts.config};
    const newKeyArmored = await generateKey({...opts, format: 'armored'});
    const privateKey = await readPrivateKey({
      armoredKey: newKeyArmored.privateKey,
    });
    const entry = new KeyStoreEntry(
      newKeyArmored.privateKey,
      newKeyArmored.publicKey,
      newKeyArmored.revocationCertificate,
      privateKey.getFingerprint(),
      privateKey.isDecrypted()
    );
    return {entry, ...newKeyArmored};
  }

  public async getProperties(): Promise<IKeyStoreEntryProperties> {
    const privateKey = await readPrivateKey({
      armoredKey: this.privateKeyArmored,
    });
    return {
      algorithm: privateKey.getAlgorithmInfo(),
      fingerprints: {
        private: privateKey.getFingerprint(),
        signing: (await privateKey.getSigningKey()).getFingerprint(),
        encryption: (await privateKey.getEncryptionKey()).getFingerprint(),
        subkeys: privateKey.getSubkeys().map((key) =>
          key.getFingerprint()
        ),
      },
      locked: this.locked,
      primaryUser: (await privateKey.getPrimaryUser()).user.userID?.userID,
      keyIds: {
        private: privateKey.getKeyID().toHex(),
        signing: (await privateKey.getSigningKey()).getKeyID().toHex(),
        encryption: (await privateKey.getEncryptionKey()).getKeyID().toHex(),
        subkeys: privateKey
          .getSubkeys()
          .map((key) => key.getKeyID().toHex()),
      },
      subKeysCount: privateKey.getSubkeys().length,
    };
  }

  public initialize(passphrase?: string, durationS?: number) {
    return this.unlock(passphrase, durationS);
  }

  public lock() {
    this.privateKey = undefined;
    this.timer$?.unsubscribe();
    this.locked$.next(true);
  }

  public async saveToFile() {
    const properties = await this.getProperties();
    const baseName = properties.primaryUser || properties.fingerprints.private
    const suffix = {
      privateKey: " private.asc",
      publicKey: " public.asc",
      revocationCert: " revCert.asc",
    }

    function saveFile(blobParts: BlobPart, filename: string) {
      const blob = new Blob([blobParts], {
        type: 'text/plain',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename.replace(/[/\\?%*:|"<>]/g, '')}.asc`;
      link.click();
      link.remove();
    }

    function filename(suffix: string) {
      return `${baseName.replace(/[/\\?%*:|"<>]/g, '')}${suffix}`
    }

    saveFile(this.privateKeyArmored, filename(suffix.privateKey));
    if (this.publicKeyArmored !== '') {
      saveFile(this.publicKeyArmored, filename(suffix.publicKey));
    }
    if (this.revocationCert !== '') {
      saveFile(this.revocationCert, filename(suffix.revocationCert));
    }
  }

  public async unlock(
    passphrase?: string,
    durationS: number = PASSPHRASE_CACHE_DURATION_SEC
  ) {
    if (!(this.privateKey instanceof PrivateKey)) {
      try {
        const privateKey = await readPrivateKey({
          armoredKey: this.privateKeyArmored,
        });
        if (privateKey.isDecrypted()) {
          this.privateKey = privateKey;
        } else {
          await this.decryptKey(privateKey, passphrase, durationS);
        }
      } catch (error) {
        throw error;
      }
    }
  }

  private async decryptKey(
    privateKey: PrivateKey,
    passphrase?: string,
    durationS: number = PASSPHRASE_CACHE_DURATION_SEC
  ) {
    this.privateKey = await decryptKey({
      privateKey,
      passphrase,
    });
    this.timer$ = timer(new Date(Date.now() + durationS * 1000)).subscribe(() =>
      this.lock()
    );
    this.locked$.next(false);
  }
}

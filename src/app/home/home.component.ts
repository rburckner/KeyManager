import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {IKeyStoreEntryProperties} from "../services/keystore/key-store-entry.class";
import {MatDialog} from "@angular/material/dialog";
import {UiService} from "../services/ui/ui.service";
import {KeystoreService} from "../services/keystore/keystore.service";
import {CreateComponent} from "../shared/dialog/create/create.component";
import {ImportComponent} from "../shared/dialog/import/import.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  public keyStoreEntryProperties: IKeyStoreEntryProperties[] = [];
  private subscriptions: Subscription[] = [];
  displayedColumns: string[] = ['user', 'subKeys', 'remove', 'save'];

  constructor(public dialog: MatDialog,
              public keyStoreService: KeystoreService,
              public uiService: UiService) {
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.keyStoreService.keyCount$.subscribe({
        next: () => {
          this.updateKeyList();
        },
        error: (error) => this.uiService.showToastError(error),
      })
    );
  }

  ngOnDestroy(): void {
    try {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
    } catch (error) {
      this.uiService.showToastError(error);
    }
  }

  onCreate(): void {
    this.dialog.open(CreateComponent, {
      width: '350px',
    });
  }

  onImport() {
    this.dialog.open(ImportComponent);
  }

  onRemove(fingerprint?: string) {
    if (!fingerprint) {
      this.keyStoreService.keyStore.flushEntries();
    } else {
      try {
        this.keyStoreService.deleteKey(fingerprint);
      } catch (error) {
        this.uiService.showToastError(error);
      }
    }
  }

  onSave(fingerprint?: string) {
    try {
      if (fingerprint) {
        this.keyStoreService.getKey(fingerprint).saveToFile();
      } else {
        this.keyStoreService
          .getEntries()
          .forEach((entry) => entry.saveToFile());
      }
    } catch (error) {
      this.uiService.showToastError(error);
    }
  }

  private updateKeyList() {
    this.keyStoreService.keyStore
      .getProperties()
      .then((properties) => {
        this.keyStoreEntryProperties = properties;
      })
      .catch((error) => this.uiService.showToast(error));
  }
}

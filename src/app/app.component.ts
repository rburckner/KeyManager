import {Component} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {AboutComponent} from "./shared/dialog/about/about.component"
import {CreateComponent} from "./shared/dialog/create/create.component";
import {ImportComponent} from "./shared/dialog/import/import.component";
import {KeystoreService} from "./services/keystore/keystore.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public dialog: MatDialog,
              public keyStoreService: KeystoreService,
  ) {
  }

  onAbout(): void {
    this.dialog.open(AboutComponent);
  }

  onCreate(): void {
    this.dialog.open(CreateComponent, {
      width: '350px',
    });
  }

  onImport() {
    this.dialog.open(ImportComponent);
  }

  onSave() {
    this.keyStoreService
      .getEntries()
      .forEach((entry) => entry.saveToFile());
  }
}

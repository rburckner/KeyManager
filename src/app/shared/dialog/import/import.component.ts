import { Component, OnInit } from '@angular/core';
import {Subscription} from "rxjs";
import {MatDialogRef} from "@angular/material/dialog";
import {UiService} from "../../../services/ui/ui.service";
import {FormControl} from "@angular/forms";
import {MaxSizeValidator} from "@angular-material-components/file-input";
import {KeystoreService} from "../../../services/keystore/keystore.service";

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  public fileControl: FormControl;
  private ascImportFiles: File[] = [];
  fileReader = new FileReader();

  constructor(
    public dialogRef: MatDialogRef<ImportComponent>,
    public keyStoreService: KeystoreService,
    public uiService: UiService
  ) {
    this.fileControl = new FormControl('', [MaxSizeValidator(25 * 1024)]);
    this.fileReader.onloadend = (loadEvent) => {
      if (loadEvent.target && loadEvent.target.result) {
        this.keyStoreService.keyStore
          .importKey(loadEvent.target.result as string)
          .catch((error) => this.uiService.showToastError(error));
      }
      if (this.ascImportFiles.length > 0) {
        this.readASC_Files();
      } else {
        this.dialogRef.close();
      }
    };
    this.fileReader.onerror = (error) => {
      this.uiService.showToastError(error);
    };
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.fileControl.valueChanges.subscribe({
        next: (files: File[]) => {
          if (files.length > 0) {
            this.ascImportFiles = files;
            this.readASC_Files();
            this.fileControl.setValue('');
          }
        },
        error: (error) => this.uiService.showToastError(error),
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private readASC_Files() {
    const file = this.ascImportFiles.shift();
    if (file) {
      this.fileReader.readAsText(file);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

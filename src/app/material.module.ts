import {NgxMatFileInputModule} from '@angular-material-components/file-input';
import {NgModule} from '@angular/core';
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatCardModule} from "@angular/material/card";
import {MatDividerModule} from "@angular/material/divider";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDialogModule} from "@angular/material/dialog";
import {MatIconModule} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {MatMenuModule} from "@angular/material/menu";

const material = [
  NgxMatFileInputModule,
  MatButtonModule,
  MatIconModule,
  MatToolbarModule,
  MatCardModule,
  MatDividerModule,
  MatDialogModule,
  MatInputModule,
  MatFormFieldModule,
  MatTableModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatSidenavModule,
  MatListModule,
  MatMenuModule
]

@NgModule({
  declarations: [],
  imports: material,
  exports: material
})
export class MaterialModule {
}

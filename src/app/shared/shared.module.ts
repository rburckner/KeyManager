import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ImportComponent} from './dialog/import/import.component';
import {CreateComponent} from './dialog/create/create.component';
import {AboutComponent} from './dialog/about/about.component';
import {MaterialModule} from "../material.module";
import {ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [ImportComponent, CreateComponent, AboutComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  // exports: [ImportComponent, CreateComponent, AboutComponent]
})
export class SharedModule {
}

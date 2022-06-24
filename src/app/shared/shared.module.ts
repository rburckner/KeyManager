import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ImportComponent} from './dialog/import/import.component';
import {CreateComponent} from './dialog/create/create.component';
import {AboutComponent} from './dialog/about/about.component';
import {MaterialModule} from "../material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FlexLayoutModule} from "@angular/flex-layout";


@NgModule({
  declarations: [ImportComponent, CreateComponent, AboutComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
})
export class SharedModule {
}

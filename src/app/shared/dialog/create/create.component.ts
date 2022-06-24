import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UiService} from "../../../services/ui/ui.service";
import {KeystoreService} from "../../../services/keystore/keystore.service";
import {ConfirmedValidator} from "../../validators";

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  PASSPHRASE_MIN_LENGTH = 8

  public createKeyForm!: FormGroup;
  public createKeyError = '';

  constructor(
    public dialogRef: MatDialogRef<CreateComponent>,
    private formBuilder: FormBuilder,
    public keyStoreService: KeystoreService,
    public uiService: UiService
  ) {}

  ngOnInit(): void {
    this.resetCreationForm();
  }

  private resetCreationForm() {
    this.createKeyForm = this.formBuilder.group(
      {
        name: [''],
        email: ['', Validators.email],
        comment: [''],
        password: ['', [Validators.required, Validators.minLength(this.PASSPHRASE_MIN_LENGTH)]],
        confirm_password: ['', [Validators.required]],
      },
      {
        validator: ConfirmedValidator('password', 'confirm_password'),
      }
    );
  }

  onSubmit() {
    const { name, email, comment, password } = this.createKeyForm.value;

    try {
      this.keyStoreService.createECC_KeyWithUser(
        { name, email, comment },
        password
      );
      this.resetCreationForm();
      this.dialogRef.close();
    } catch (error) {
      this.uiService.showToastError(error);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }}

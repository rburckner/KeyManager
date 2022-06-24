import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from "@angular/material/snack-bar";

const TOAST_DURATION = 5000;

@Injectable({
  providedIn: 'root'
})
export class UiService {
  constructor(private snackBar: MatSnackBar) {
  }

  showToast(message: string, action = 'Close', config?: MatSnackBarConfig) {
    this.snackBar.open(message, action, config || {duration: TOAST_DURATION});
  }

  showToastError(error: any, action = 'Close', config?: MatSnackBarConfig) {
    const message = error.message || error.error.message || 'Unknown Error';
    this.snackBar.open(message, action, config || {duration: TOAST_DURATION});
  }
}

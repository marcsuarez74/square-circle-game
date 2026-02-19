import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-icon" [class]="data.type || 'warning'">
        <mat-icon>{{ getIcon() }}</mat-icon>
      </div>
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText }}
        </button>
        <button mat-raised-button [color]="getButtonColor()" (click)="onConfirm()">
          {{ data.confirmText }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 24px;
      text-align: center;
      min-width: 320px;
    }

    .dialog-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: white;
      }

      &.warning {
        background-color: var(--warning);
      }

      &.danger {
        background-color: var(--error);
      }

      &.info {
        background-color: var(--info);
      }
    }

    h2 {
      margin: 0 0 16px 0;
      color: var(--text-primary);
      font-size: 1.25rem;
      font-weight: 600;
    }

    mat-dialog-content {
      padding: 0;
      margin-bottom: 24px;

      p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 1rem;
        line-height: 1.5;
      }
    }

    mat-dialog-actions {
      padding: 0;
      gap: 12px;
    }
  `]
})
export class ConfirmDialog {
  private dialogRef = inject(MatDialogRef<ConfirmDialog>);
  public data: ConfirmDialogData = inject(MAT_DIALOG_DATA);

  getIcon(): string {
    switch (this.data.type) {
      case 'danger': return 'warning';
      case 'info': return 'info';
      default: return 'warning';
    }
  }

  getButtonColor(): string {
    switch (this.data.type) {
      case 'danger': return 'warn';
      case 'info': return 'primary';
      default: return 'accent';
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

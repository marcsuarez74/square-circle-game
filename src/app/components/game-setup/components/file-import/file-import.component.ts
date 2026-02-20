import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface FileImportEvent {
  file: File;
  type: 'excel' | 'json';
}

@Component({
  selector: 'app-file-import',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './file-import.component.html',
  styleUrl: './file-import.component.scss',
})
export class FileImportComponent {
  fileSelected = output<FileImportEvent>();

  isExcelDragging = false;
  isJsonDragging = false;

  onExcelDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isExcelDragging = true;
  }

  onExcelDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isExcelDragging = false;
  }

  onExcelDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isExcelDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        this.fileSelected.emit({ file, type: 'excel' });
      }
    }
  }

  onExcelFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileSelected.emit({ file: input.files[0], type: 'excel' });
    }
  }

  onJsonDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isJsonDragging = true;
  }

  onJsonDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isJsonDragging = false;
  }

  onJsonDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isJsonDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.json')) {
        this.fileSelected.emit({ file, type: 'json' });
      }
    }
  }

  onJsonFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileSelected.emit({ file: input.files[0], type: 'json' });
    }
  }
}

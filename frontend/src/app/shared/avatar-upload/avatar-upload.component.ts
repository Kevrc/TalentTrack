import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-avatar-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="avatar-upload">
      <h3>Subir Avatar</h3>
      
      <div class="upload-area" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
        <input 
          type="file" 
          #fileInput 
          (change)="onFileSelected($event)" 
          accept="image/*"
          hidden
        />
        <button (click)="fileInput.click()" class="upload-btn">
          📁 Seleccionar imagen
        </button>
        <p>o arrastra una imagen aquí</p>
      </div>

      <div *ngIf="preview" class="preview">
        <img [src]="preview" alt="preview" />
        <p>{{ fileName }}</p>
        <button (click)="clearPreview()" class="clear-btn">Limpiar</button>
      </div>

      <div *ngIf="uploadedPath" class="success">
        <p>✓ URL de la imagen:</p>
        <code>{{ uploadedPath }}</code>
        <button (click)="copyToClipboard()" class="copy-btn">Copiar URL</button>
      </div>
    </div>
  `,
  styles: [`
    .avatar-upload {
      padding: 20px;
      max-width: 400px;
    }

    .upload-area {
      border: 2px dashed #d1d5db;
      border-radius: 10px;
      padding: 30px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .upload-area:hover {
      border-color: #c2353c;
      background: #fff6f6;
    }

    .upload-btn {
      background: #c2353c;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .upload-btn:hover {
      background: #a82a31;
    }

    .preview {
      margin-top: 20px;
      text-align: center;
    }

    .preview img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 10px;
    }

    .clear-btn {
      background: #e5e7eb;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 10px;
    }

    .success {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
    }

    code {
      display: block;
      background: #f3f4f6;
      padding: 10px;
      border-radius: 6px;
      margin: 10px 0;
      word-break: break-all;
      font-family: monospace;
    }

    .copy-btn {
      background: #10b981;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .copy-btn:hover {
      background: #059669;
    }
  `]
})
export class AvatarUploadComponent {
  @Output() photoUpdated = new EventEmitter<string>();
  
  preview: string | null = null;
  fileName: string = '';
  uploadedPath: string = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files[0]) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  processFile(file: File): void {
    this.fileName = file.name;
    
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.preview = e.target?.result as string;
      // En producción, aquí subir a backend y obtener URL
      // Por ahora, mostrar path sugerido
      this.uploadedPath = `assets/avatars/${file.name}`;
    };
    reader.readAsDataURL(file);
  }

  clearPreview(): void {
    this.preview = null;
    this.fileName = '';
    this.uploadedPath = '';
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.uploadedPath);
    localStorage.setItem('foto_url', this.uploadedPath);
    this.photoUpdated.emit(this.uploadedPath);
    alert('✓ Foto actualizada correctamente');
  }
}

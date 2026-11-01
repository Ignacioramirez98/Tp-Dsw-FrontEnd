import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const TAMANIO_MAXIMO = 5 * 1024 * 1024; // igual que el límite de multer en el backend

/**
 * Elegir una imagen con vista previa. Valida tipo y tamaño antes de emitir.
 *   <app-selector-imagen [imagenActual]="url" (archivoElegido)="imagen = $event" />
 */
@Component({
  selector: 'app-selector-imagen',
  standalone: true,
  template: `
    <div class="selector">
      <div class="vista" [class.vacia]="!vistaPrevia">
        @if (vistaPrevia) {
          <img [src]="vistaPrevia" [alt]="'Imagen de ' + (descripcion || 'el registro')">
        } @else {
          <i class="bi bi-image" aria-hidden="true"></i><span>Sin imagen</span>
        }
      </div>
      <div class="controles">
        <label class="form-label fw-semibold" [for]="id">Imagen <span class="text-secondary fw-normal">(opcional)</span></label>
        <input class="form-control" type="file" [id]="id" accept="image/jpeg,image/png,image/webp,image/gif"
               [class.is-invalid]="error" [attr.aria-describedby]="id + '-ayuda'" (change)="alElegir($event)">
        @if (error) {
          <div class="invalid-feedback d-block" [id]="id + '-ayuda'">{{ error }}</div>
        } @else {
          <div class="form-text" [id]="id + '-ayuda'">JPG, PNG, WEBP o GIF de hasta 5 MB.{{ imagenActual ? ' Si no elegís otra, se mantiene la actual.' : '' }}</div>
        }
        @if (archivo) {
          <button type="button" class="btn btn-link btn-sm px-0" (click)="quitar()">Descartar imagen elegida</button>
        }
      </div>
    </div>
  `,
  styles: `
    .selector { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start; margin-bottom: 1rem; }
    .vista { width: 120px; height: 120px; flex: none; border-radius: 12px; overflow: hidden; background: #ECE8DD;
             display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.25rem;
             color: #5B665F; font-size: 0.75rem; }
    .vista i { font-size: 1.75rem; }
    .vista img { width: 100%; height: 100%; object-fit: cover; }
    .controles { flex: 1 1 220px; min-width: 0; }
  `,
})
export class SelectorImagenComponent implements OnDestroy {
  @Input() id = 'imagen';
  /** URL de la imagen ya guardada (en edición). */
  @Input() imagenActual: string | null = null;
  /** Texto para el alt de la vista previa. */
  @Input() descripcion = '';
  /** Emite el archivo válido elegido, o null si se descarta. */
  @Output() archivoElegido = new EventEmitter<File | null>();

  archivo: File | null = null;
  error = '';
  private urlLocal: string | null = null;

  get vistaPrevia(): string | null {
    return this.urlLocal ?? this.imagenActual;
  }

  // Se guarda la referencia del input para poder limpiarlo
  private input?: HTMLInputElement;

  alElegir(evento: Event): void {
    this.input = evento.target as HTMLInputElement;
    const archivo = this.input.files?.[0] ?? null;
    this.liberar();
    this.error = '';
    this.archivo = null;

    if (archivo && !TIPOS_PERMITIDOS.includes(archivo.type)) {
      this.error = 'Formato no permitido. Elegí una imagen JPG, PNG, WEBP o GIF.';
    } else if (archivo && archivo.size > TAMANIO_MAXIMO) {
      this.error = 'La imagen pesa más de 5 MB.';
    } else if (archivo) {
      this.archivo = archivo;
      this.urlLocal = URL.createObjectURL(archivo);
    }
    this.archivoElegido.emit(this.archivo);
  }

  quitar(): void {
    if (this.input) this.input.value = '';
    this.liberar();
    this.archivo = null;
    this.error = '';
    this.archivoElegido.emit(null);
  }

  private liberar(): void {
    if (this.urlLocal) URL.revokeObjectURL(this.urlLocal);
    this.urlLocal = null;
  }

  ngOnDestroy(): void {
    this.liberar();
  }
}

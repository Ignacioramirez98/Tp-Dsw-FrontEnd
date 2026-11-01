import { Component, Injectable, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DatosConfirmacion {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  peligro?: boolean; // botón rojo para acciones destructivas
}

@Component({
  selector: 'app-confirmacion-dialog',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <div class="p-4">
      <h2 mat-dialog-title class="h5 mb-2 p-0">{{ datos.titulo }}</h2>
      <p class="mb-4">{{ datos.mensaje }}</p>
      <div class="d-flex justify-content-end gap-2 flex-wrap">
        <button type="button" class="btn btn-outline-secondary" (click)="ref.close(false)">Cancelar</button>
        <button type="button" class="btn" [class.btn-danger]="datos.peligro" [class.btn-primary]="!datos.peligro"
                (click)="ref.close(true)" cdkFocusInitial>{{ datos.textoConfirmar ?? 'Confirmar' }}</button>
      </div>
    </div>
  `,
})
export class ConfirmacionDialogComponent {
  readonly datos = inject<DatosConfirmacion>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<ConfirmacionDialogComponent, boolean>);
}

/** Reemplaza a confirm(): abre un diálogo accesible y devuelve true si el usuario confirma. */
@Injectable({ providedIn: 'root' })
export class ConfirmacionService {
  private readonly dialog = inject(MatDialog);

  confirmar(datos: DatosConfirmacion): Observable<boolean> {
    return this.dialog
      .open(ConfirmacionDialogComponent, { data: datos, width: '420px', maxWidth: '92vw', autoFocus: 'dialog' })
      .afterClosed()
      .pipe(map((resultado) => resultado === true));
  }
}

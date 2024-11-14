import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog'; 
import { WarningComponent } from './warning.component.js';

@NgModule({
  declarations: [WarningComponent],
  imports: [
    CommonModule,
    MatDialogModule // Asegúrate de importar el MatDialogModule aquí también
  ],
  exports: [WarningComponent], // Exportamos el componente para que pueda ser utilizado fuera de este módulo
})
export class WarningModule {}

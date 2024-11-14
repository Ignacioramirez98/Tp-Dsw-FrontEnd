import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.css']
})
export class WarningComponent {
  message: string;
  color: string;  // Definir la propiedad color

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.message = data.message;
    this.color = data.color || 'red';  // Asignar color, por defecto rojo
  }
}

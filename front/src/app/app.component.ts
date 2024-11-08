import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Importa RouterModule

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html', // Tu template HTML
  styleUrls: ['./app.component.css'], // Tus estilos CSS
  standalone: true, // Marca el componente como standalone
  imports: [RouterModule], // Asegúrate de importar RouterModule aquí
})
export class AppComponent {
  title = 'Mi Aplicación Angular';
}

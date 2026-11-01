import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Importa RouterModule

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html', // Marca el componente como standalone
    imports: [RouterModule]
})
export class AppComponent {
  title = 'Mi Aplicación Angular';
}

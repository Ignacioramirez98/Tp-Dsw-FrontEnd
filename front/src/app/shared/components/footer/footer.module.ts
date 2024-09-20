import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,  // Marca este componente como autónomo
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  imports: []  // Aquí puedes agregar otros componentes autónomos o módulos que necesite el footer
})
export class FooterComponent {}
